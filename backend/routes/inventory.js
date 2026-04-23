const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public read routes for authenticated users
router.get('/', authMiddleware, inventoryController.getAll);
router.get('/low-stock', authMiddleware, inventoryController.getLowStockItems);
router.get('/stats', authMiddleware, inventoryController.getStats);
router.get('/:id', authMiddleware, inventoryController.getById);

// Admin only routes
router.post('/', adminMiddleware, inventoryController.create);
router.put('/:id', adminMiddleware, inventoryController.update);
router.delete('/:id', adminMiddleware, inventoryController.delete);

module.exports = router;
