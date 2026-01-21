/**
 * Dashboard Routes - Role-specific Dashboard APIs
 * Phase 5.1: Dashboard UX Finalization
 */

const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard/data
 * @desc    Get role-specific dashboard data
 * @access  Private
 */
router.get('/data', authenticateToken, DashboardController.getDashboardData);

/**
 * @route   GET /api/v1/dashboard/actions
 * @desc    Get quick actions based on user role
 * @access  Private
 */
router.get('/actions', authenticateToken, DashboardController.getQuickActions);

module.exports = router;