/**
 * UI Routes - Frontend Dashboard Templates
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Serves basic UI skeleton for dashboards
 */

const express = require('express');
const UIController = require('../controllers/UIController');

const router = express.Router();

/**
 * @route   GET /
 * @desc    Redirect to dashboard
 * @access  Public
 */
router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

/**
 * @route   GET /login
 * @desc    Serve login page
 * @access  Public
 */
router.get('/login', UIController.serveLogin);

/**
 * @route   GET /dashboard
 * @desc    Serve main dashboard
 * @access  Public (auth handled by frontend)
 */
router.get('/dashboard', UIController.serveDashboard);

/**
 * @route   GET /patients
 * @desc    Serve patients page placeholder
 * @access  Public
 */
router.get('/patients', UIController.servePatients);

/**
 * @route   GET /appointments
 * @desc    Serve appointments page placeholder
 * @access  Public
 */
router.get('/appointments', UIController.serveAppointments);

/**
 * @route   GET /visits
 * @desc    Serve visits page placeholder
 * @access  Public
 */
router.get('/visits', UIController.serveVisits);

/**
 * @route   GET /users
 * @desc    Serve users page placeholder
 * @access  Public
 */
router.get('/users', UIController.serveUsers);

/**
 * @route   GET /audit
 * @desc    Serve audit logs page placeholder
 * @access  Public
 */
router.get('/audit', UIController.serveAudit);

module.exports = router;