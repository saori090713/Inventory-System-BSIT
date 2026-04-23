const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public read routes
router.get('/', authMiddleware, unitController.getAll);
router.get('/:id', authMiddleware, unitController.getById);

// Admin only routes
router.post('/', adminMiddleware, unitController.create);
router.put('/:id', adminMiddleware, unitController.update);
router.delete('/:id', adminMiddleware, unitController.delete);

module.exports = router;
