const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public read routes
router.get('/', authMiddleware, categoryController.getAll);
router.get('/:id', authMiddleware, categoryController.getById);

// Admin only routes
router.post('/', adminMiddleware, categoryController.create);
router.put('/:id', adminMiddleware, categoryController.update);
router.delete('/:id', adminMiddleware, categoryController.delete);

module.exports = router;
