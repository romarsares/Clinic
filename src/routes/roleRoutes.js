const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');

const router = express.Router();

router.use(authenticateToken);

// GET /api/v1/roles - List roles
router.get('/', requireRole(['Super User', 'SuperAdmin', 'Owner', 'Doctor']), async (req, res) => {
    try {
        const isSuperAdmin = req.user.roles.includes('Super User') || req.user.roles.includes('SuperAdmin');
        
        let query, params;
        if (isSuperAdmin) {
            // SuperAdmin sees all roles from all clinics
            query = 'SELECT id, name, description, clinic_id FROM roles ORDER BY clinic_id, name';
            params = [];
        } else {
            // Others see only their clinic's roles
            query = 'SELECT id, name, description FROM roles WHERE clinic_id = ? ORDER BY name';
            params = [req.user.clinic_id];
        }
        
        const [roles] = await db.execute(query, params);
        res.json({ success: true, data: roles });
    } catch (error) {
        console.error('Error loading roles:', error);
        res.status(500).json({ success: false, message: 'Failed to load roles' });
    }
});

// POST /api/v1/roles - Create role
router.post('/', requireRole(['Super User', 'SuperAdmin', 'Owner', 'Doctor']), auditLog('role', 'create'), async (req, res) => {
    try {
        const { name, description, clinic_id } = req.body;
        const isSuperAdmin = req.user.roles.includes('Super User') || req.user.roles.includes('SuperAdmin');
        
        // SuperAdmin can specify clinic_id, others use their own
        const targetClinicId = isSuperAdmin && clinic_id ? clinic_id : req.user.clinic_id;
        
        const [result] = await db.execute(
            'INSERT INTO roles (clinic_id, name, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [targetClinicId, name, description || null]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, name, description, clinic_id: targetClinicId } });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ success: false, message: 'Failed to create role' });
    }
});

// PUT /api/v1/roles/:id - Update role
router.put('/:id', requireRole(['Super User', 'SuperAdmin', 'Owner', 'Doctor']), auditLog('role', 'update'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const isSuperAdmin = req.user.roles.includes('Super User') || req.user.roles.includes('SuperAdmin');
        
        const whereClause = isSuperAdmin ? 'WHERE id = ?' : 'WHERE id = ? AND clinic_id = ?';
        const params = isSuperAdmin ? [name, description || null, req.params.id] : [name, description || null, req.params.id, req.user.clinic_id];
        
        await db.execute(
            `UPDATE roles SET name = ?, description = ?, updated_at = NOW() ${whereClause}`,
            params
        );
        res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ success: false, message: 'Failed to update role' });
    }
});

// DELETE /api/v1/roles/:id - Delete role
router.delete('/:id', requireRole(['Super User', 'SuperAdmin', 'Owner', 'Doctor']), auditLog('role', 'delete'), async (req, res) => {
    try {
        const isSuperAdmin = req.user.roles.includes('Super User') || req.user.roles.includes('SuperAdmin');
        
        const whereClause = isSuperAdmin ? 'WHERE id = ?' : 'WHERE id = ? AND clinic_id = ?';
        const params = isSuperAdmin ? [req.params.id] : [req.params.id, req.user.clinic_id];
        
        await db.execute(`DELETE FROM roles ${whereClause}`, params);
        res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ success: false, message: 'Failed to delete role' });
    }
});

module.exports = router;
