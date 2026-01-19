/**
 * Audit Routes - Audit Log Management
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Provides endpoints for viewing and managing audit logs
 */

const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { enforceTenantIsolation } = require('../middleware/tenant');
const AuditService = require('../services/AuditService');

const router = express.Router();

// Apply authentication and tenant isolation
router.use(authenticateToken);
router.use(enforceTenantIsolation);

/**
 * @route   GET /api/v1/audit/logs
 * @desc    Get audit logs for clinic
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.get('/logs',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    async (req, res) => {
        try {
            const clinicId = req.user.clinic_id;
            const filters = {
                user_id: req.query.user_id,
                entity: req.query.entity,
                action: req.query.action,
                date_from: req.query.date_from,
                date_to: req.query.date_to,
                limit: parseInt(req.query.limit) || 100,
                offset: parseInt(req.query.offset) || 0
            };

            const logs = await AuditService.getAuditLogs(clinicId, filters);
            
            res.json({
                success: true,
                data: logs,
                filters: filters
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch audit logs',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

/**
 * @route   POST /api/v1/audit/log
 * @desc    Manually log an audit event
 * @access  Private (Owner, Admin, SuperAdmin)
 */
router.post('/log',
    requireRole(['Owner', 'Admin', 'SuperAdmin']),
    async (req, res) => {
        try {
            const { action, entity, entity_id, details } = req.body;

            if (!action || !entity) {
                return res.status(400).json({
                    success: false,
                    message: 'Action and entity are required'
                });
            }

            await AuditService.logAction({
                clinic_id: req.user.clinic_id,
                user_id: req.user.id,
                action: `manual_${action}`,
                entity,
                entity_id,
                ip_address: req.ip || req.connection?.remoteAddress,
                user_agent: req.get('User-Agent'),
                method: req.method,
                url: req.originalUrl,
                request_body: { action, entity, entity_id, details }
            });

            res.json({
                success: true,
                message: 'Audit log created successfully'
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create audit log',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

module.exports = router;