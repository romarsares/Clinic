const express = require('express');
const router = express.Router();
const UserManagementController = require('../controllers/UserManagementController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, UserManagementController.getUsers);
router.post('/', authenticateToken, UserManagementController.createUser);
router.put('/:id', authenticateToken, UserManagementController.updateUser);
router.delete('/:id', authenticateToken, UserManagementController.deleteUser);

module.exports = router;