const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const userController = new UserController();

// User CRUD operations
router.get('/', authenticateToken, userController.listUsers.bind(userController));
router.post('/', authenticateToken, userController.createUser.bind(userController));
router.get('/:id', authenticateToken, userController.getUserDetails.bind(userController));
router.put('/:id', authenticateToken, userController.updateUser.bind(userController));
router.delete('/:id', authenticateToken, userController.deleteUser.bind(userController));

// User role management
router.put('/:id/roles', authenticateToken, userController.updateUserRoles.bind(userController));
router.put('/:id/status', authenticateToken, userController.updateUserStatus.bind(userController));
router.put('/:id/password', authenticateToken, userController.changePassword.bind(userController));

// Avatar management
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar.bind(userController));
router.delete('/:id/avatar', authenticateToken, userController.deleteAvatar.bind(userController));

module.exports = router;