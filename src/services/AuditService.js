/**
 * Audit Service - Comprehensive Logging for All Core Actions
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Centralized audit logging service for compliance and security
 */

const db = require('../config/database');

class AuditService {
    /**
     * Log core action with detailed context
     */
    static async logAction(actionData) {
        try {
            const {
                clinic_id,
                user_id,
                action,
                entity,
                entity_id = null,
                old_value = null,
                new_value = null,
                ip_address = null,
                user_agent = null,
                method = null,
                url = null,
                status_code = null,
                request_body = null,
                response_data = null,
                additional_context = null
            } = actionData;

            const query = `
                INSERT INTO audit_logs (
                    clinic_id, user_id, action, entity, entity_id, old_value, new_value,
                    ip_address, user_agent, method, url, status_code, request_body, 
                    response_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await db.execute(query, [
                clinic_id,
                user_id,
                action,
                entity,
                entity_id,
                old_value ? JSON.stringify(old_value) : null,
                new_value ? JSON.stringify(new_value) : null,
                ip_address,
                user_agent,
                method,
                url,
                status_code,
                request_body ? JSON.stringify(request_body) : null,
                response_data ? JSON.stringify(response_data) : null
            ]);

            return true;
        } catch (error) {
            console.error('Audit logging failed:', error);
            return false;
        }
    }

    /**
     * Log authentication events
     */
    static async logAuth(user, action, req, success = true, reason = null) {
        return this.logAction({
            clinic_id: user?.clinic_id || 1,
            user_id: user?.id || null,
            action: `auth_${action}`,
            entity: 'user',
            entity_id: user?.id || null,
            ip_address: req.ip || req.connection?.remoteAddress || '127.0.0.1',
            user_agent: req.get('User-Agent') || 'Unknown',
            method: req.method || 'POST',
            url: req.originalUrl || '/auth/login',
            status_code: success ? 200 : 401,
            new_value: {
                success,
                reason,
                email: user?.email
            }
        });
    }

    /**
     * Log CRUD operations
     */
    static async logCRUD(req, action, entity, entityId, oldValue = null, newValue = null) {
        return this.logAction({
            clinic_id: req.user?.clinic_id,
            user_id: req.user?.id,
            action,
            entity,
            entity_id: entityId,
            old_value: oldValue,
            new_value: newValue,
            ip_address: req.ip || req.connection?.remoteAddress,
            user_agent: req.get('User-Agent'),
            method: req.method,
            url: req.originalUrl,
            request_body: this.sanitizeData(req.body)
        });
    }

    /**
     * Log clinical data access
     */
    static async logClinicalAccess(req, dataType, patientId = null, visitId = null, accessType = 'view') {
        return this.logAction({
            clinic_id: req.user?.clinic_id,
            user_id: req.user?.id,
            action: `clinical_${accessType}`,
            entity: dataType,
            entity_id: visitId || patientId,
            ip_address: req.ip || req.connection?.remoteAddress,
            user_agent: req.get('User-Agent'),
            method: req.method,
            url: req.originalUrl
        });
    }

    /**
     * Get audit logs with filtering
     */
    static async getAuditLogs(clinicId, filters = {}) {
        const {
            user_id,
            entity,
            action,
            date_from,
            date_to,
            limit = 100,
            offset = 0
        } = filters;

        let whereClause = 'WHERE clinic_id = ?';
        let params = [clinicId];

        if (user_id) {
            whereClause += ' AND user_id = ?';
            params.push(user_id);
        }

        if (entity) {
            whereClause += ' AND entity = ?';
            params.push(entity);
        }

        if (action) {
            whereClause += ' AND action = ?';
            params.push(action);
        }

        if (date_from) {
            whereClause += ' AND created_at >= ?';
            params.push(date_from);
        }

        if (date_to) {
            whereClause += ' AND created_at <= ?';
            params.push(date_to);
        }

        const query = `
            SELECT a.*, u.full_name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN auth_users u ON a.user_id = u.id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const [rows] = await db.execute(query, params);
        return rows;
    }

    /**
     * Log with tenant context
     */
    static async log(tenantId, logData) {
        return this.logAction({
            clinic_id: tenantId,
            user_id: logData.user_id,
            action: logData.action,
            entity: logData.resource_type,
            entity_id: logData.resource_id,
            new_value: logData.details
        });
    }
    static sanitizeData(data) {
        if (!data || typeof data !== 'object') return data;

        const sanitized = { ...data };
        const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'key'];
        
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}

module.exports = AuditService;