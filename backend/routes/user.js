const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin only routes
router.get('/', adminMiddleware, userController.getAll);
router.get('/:id', adminMiddleware, userController.getById);
router.put('/:id/role', adminMiddleware, userController.updateRole);
router.put('/:id/toggle-status', adminMiddleware, userController.toggleActiveStatus);
router.delete('/:id', adminMiddleware, userController.delete);

module.exports = router;
