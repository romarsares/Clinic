/**
 * Multi-Tenant Middleware - Database Isolation
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Enforces strict tenant data isolation at the database level
 */

const db = require('../config/database');

/**
 * Tenant isolation middleware - ensures all queries include clinic_id filter
 */
const enforceTenantIsolation = (req, res, next) => {
    // Skip for SuperAdmin users
    if (req.user && req.user.roles && req.user.roles.includes('SuperAdmin')) {
        return next();
    }

    // Ensure user has clinic_id
    if (!req.user || !req.user.clinic_id) {
        return res.status(403).json({
            success: false,
            message: 'Access denied: No clinic association'
        });
    }

    // Add clinic_id to request for easy access
    req.clinic_id = req.user.clinic_id;
    
    next();
};

/**
 * Validate tenant middleware
 */
const validateTenant = (req, res, next) => {
    if (!req.user || !req.user.tenant_id) {
        return res.status(403).json({ error: 'Access denied: No tenant association' });
    }
    next();
};

/**
 * Validate tenant access to resource
 */
const validateTenantAccess = (tableName, resourceId, clinicId) => {
    return async (req, res, next) => {
        try {
            // Skip for SuperAdmin
            if (req.user.roles.includes('SuperAdmin')) {
                return next();
            }

            const query = `SELECT clinic_id FROM ${tableName} WHERE id = ?`;
            const [rows] = await db.execute(query, [resourceId || req.params.id]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            const resourceClinicId = rows[0].clinic_id;
            const userClinicId = clinicId || req.user.clinic_id;

            if (resourceClinicId !== userClinicId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Resource belongs to different clinic'
                });
            }

            next();
        } catch (error) {
            console.error('Tenant validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Access validation failed'
            });
        }
    };
};

/**
 * Database query wrapper with automatic tenant filtering
 */
class TenantDB {
    static getConnection(tenantId) {
        return {
            execute: async (query, params = []) => {
                return db.execute(query, params);
            }
        };
    }

    constructor(db) {
        this.db = db;
    }

    /**
     * Execute query with automatic clinic_id filtering
     */
    async execute(query, params = [], clinicId = null) {
        // If clinic_id is provided, automatically add it to WHERE clause
        if (clinicId && query.toLowerCase().includes('select') && query.toLowerCase().includes('where')) {
            // Add clinic_id filter to existing WHERE clause
            const modifiedQuery = query.replace(/WHERE/i, 'WHERE clinic_id = ? AND');
            return this.db.execute(modifiedQuery, [clinicId, ...params]);
        }
        
        return this.db.execute(query, params);
    }

    /**
     * Safe select with mandatory clinic_id filtering
     */
    async selectWithTenant(table, conditions = {}, clinicId) {
        if (!clinicId) {
            throw new Error('Clinic ID is required for tenant-safe queries');
        }

        const whereConditions = ['clinic_id = ?'];
        const whereParams = [clinicId];

        // Add additional conditions
        Object.entries(conditions).forEach(([key, value]) => {
            whereConditions.push(`${key} = ?`);
            whereParams.push(value);
        });

        const query = `SELECT * FROM ${table} WHERE ${whereConditions.join(' AND ')}`;
        return this.db.execute(query, whereParams);
    }

    /**
     * Safe insert with automatic clinic_id injection
     */
    async insertWithTenant(table, data, clinicId) {
        if (!clinicId) {
            throw new Error('Clinic ID is required for tenant-safe inserts');
        }

        // Ensure clinic_id is included in data
        const insertData = { ...data, clinic_id: clinicId };
        
        const columns = Object.keys(insertData);
        const placeholders = columns.map(() => '?').join(', ');
        const values = Object.values(insertData);

        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        return this.db.execute(query, values);
    }

    /**
     * Safe update with clinic_id validation
     */
    async updateWithTenant(table, data, conditions, clinicId) {
        if (!clinicId) {
            throw new Error('Clinic ID is required for tenant-safe updates');
        }

        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const setValues = Object.values(data);

        const whereConditions = ['clinic_id = ?'];
        const whereParams = [clinicId];

        Object.entries(conditions).forEach(([key, value]) => {
            whereConditions.push(`${key} = ?`);
            whereParams.push(value);
        });

        const query = `UPDATE ${table} SET ${setClause} WHERE ${whereConditions.join(' AND ')}`;
        return this.db.execute(query, [...setValues, ...whereParams]);
    }

    /**
     * Safe delete with clinic_id validation
     */
    async deleteWithTenant(table, conditions, clinicId) {
        if (!clinicId) {
            throw new Error('Clinic ID is required for tenant-safe deletes');
        }

        const whereConditions = ['clinic_id = ?'];
        const whereParams = [clinicId];

        Object.entries(conditions).forEach(([key, value]) => {
            whereConditions.push(`${key} = ?`);
            whereParams.push(value);
        });

        const query = `DELETE FROM ${table} WHERE ${whereConditions.join(' AND ')}`;
        return this.db.execute(query, whereParams);
    }
}

/**
 * Tenant data validation utilities
 */
const TenantValidator = {
    /**
     * Validate that all referenced resources belong to the same clinic
     */
    async validateCrossReferences(references, clinicId) {
        for (const { table, id } of references) {
            const query = `SELECT clinic_id FROM ${table} WHERE id = ?`;
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                throw new Error(`Referenced ${table} with id ${id} not found`);
            }
            
            if (rows[0].clinic_id !== clinicId) {
                throw new Error(`Referenced ${table} belongs to different clinic`);
            }
        }
        return true;
    },

    /**
     * Validate user belongs to clinic
     */
    async validateUserClinic(userId, clinicId) {
        const query = 'SELECT clinic_id FROM auth_users WHERE id = ?';
        const [rows] = await db.execute(query, [userId]);
        
        if (rows.length === 0) {
            throw new Error('User not found');
        }
        
        if (rows[0].clinic_id !== clinicId) {
            throw new Error('User belongs to different clinic');
        }
        
        return true;
    }
};

/**
 * Tenant statistics and monitoring
 */
const TenantMonitor = {
    /**
     * Get tenant data usage statistics
     */
    async getTenantStats(clinicId) {
        const tables = [
            'auth_users', 'patients', 'appointments', 'visits', 
            'visit_diagnoses', 'visit_vital_signs', 'visit_notes'
        ];
        
        const stats = {};
        
        for (const table of tables) {
            try {
                const query = `SELECT COUNT(*) as count FROM ${table} WHERE clinic_id = ?`;
                const [rows] = await db.execute(query, [clinicId]);
                stats[table] = rows[0].count;
            } catch (error) {
                // Table might not exist or have clinic_id column
                stats[table] = 0;
            }
        }
        
        return stats;
    },

    /**
     * Audit tenant data integrity
     */
    async auditTenantIntegrity(clinicId) {
        const issues = [];
        
        // Check for orphaned records
        const orphanChecks = [
            {
                table: 'patients',
                reference: 'clinics',
                foreignKey: 'clinic_id'
            },
            {
                table: 'appointments',
                reference: 'patients',
                foreignKey: 'patient_id'
            },
            {
                table: 'visits',
                reference: 'patients',
                foreignKey: 'patient_id'
            }
        ];
        
        for (const check of orphanChecks) {
            const query = `
                SELECT COUNT(*) as count 
                FROM ${check.table} t1 
                LEFT JOIN ${check.reference} t2 ON t1.${check.foreignKey} = t2.id 
                WHERE t1.clinic_id = ? AND t2.id IS NULL
            `;
            
            try {
                const [rows] = await db.execute(query, [clinicId]);
                if (rows[0].count > 0) {
                    issues.push({
                        type: 'orphaned_records',
                        table: check.table,
                        count: rows[0].count
                    });
                }
            } catch (error) {
                issues.push({
                    type: 'audit_error',
                    table: check.table,
                    error: error.message
                });
            }
        }
        
        return issues;
    }
};

module.exports = {
    enforceTenantIsolation,
    validateTenant,
    validateTenantAccess,
    TenantDB,
    TenantValidator,
    TenantMonitor
};