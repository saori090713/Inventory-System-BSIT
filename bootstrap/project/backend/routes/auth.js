const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verifyToken);
router.get('/users/list', authController.getAllUsers); // Public endpoint - get all active users

module.exports = router;
