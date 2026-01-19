/**
 * Tenant Management Routes - Multi-Tenant Monitoring and Validation
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Provides endpoints for tenant data monitoring and validation
 */

const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { TenantMonitor, TenantValidator } = require('../middleware/tenant');
const { auditLog } = require('../middleware/audit');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/tenant/stats
 * @desc    Get tenant data usage statistics
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.get('/stats',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('tenant', 'stats_view'),
    async (req, res) => {
        try {
            const clinicId = req.user.roles.includes('SuperAdmin') && req.query.clinic_id 
                ? req.query.clinic_id 
                : req.user.clinic_id;

            const stats = await TenantMonitor.getTenantStats(clinicId);
            
            res.json({
                success: true,
                data: {
                    clinic_id: clinicId,
                    statistics: stats,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error fetching tenant stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tenant statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

/**
 * @route   GET /api/v1/tenant/audit
 * @desc    Audit tenant data integrity
 * @access  Private (Owner, SuperAdmin)
 */
router.get('/audit',
    requireRole(['Owner', 'SuperAdmin']),
    auditLog('tenant', 'integrity_audit'),
    async (req, res) => {
        try {
            const clinicId = req.user.roles.includes('SuperAdmin') && req.query.clinic_id 
                ? req.query.clinic_id 
                : req.user.clinic_id;

            const issues = await TenantMonitor.auditTenantIntegrity(clinicId);
            
            res.json({
                success: true,
                data: {
                    clinic_id: clinicId,
                    issues: issues,
                    issues_count: issues.length,
                    status: issues.length === 0 ? 'healthy' : 'issues_found',
                    audited_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error auditing tenant integrity:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to audit tenant integrity',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

/**
 * @route   POST /api/v1/tenant/validate
 * @desc    Validate tenant data relationships
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.post('/validate',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    auditLog('tenant', 'data_validation'),
    async (req, res) => {
        try {
            const clinicId = req.user.roles.includes('SuperAdmin') && req.body.clinic_id 
                ? req.body.clinic_id 
                : req.user.clinic_id;

            const { references } = req.body;

            if (!references || !Array.isArray(references)) {
                return res.status(400).json({
                    success: false,
                    message: 'References array is required'
                });
            }

            await TenantValidator.validateCrossReferences(references, clinicId);
            
            res.json({
                success: true,
                message: 'All references validated successfully',
                data: {
                    clinic_id: clinicId,
                    validated_references: references.length,
                    validated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error validating tenant data:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Validation failed',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Validation error'
            });
        }
    }
);

module.exports = router;