const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');

router.post('/stock-in', authenticate, InventoryController.stockIn);
router.post('/stock-out', authenticate, InventoryController.stockOut);
router.get('/history', authenticate, InventoryController.getHistory);
router.get('/dashboard', authenticate, InventoryController.getDashboardStats);

module.exports = router;