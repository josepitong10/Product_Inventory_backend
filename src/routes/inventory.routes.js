const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/stock-in', InventoryController.stockIn);
router.post('/stock-out', InventoryController.stockOut);
router.get('/history', InventoryController.getHistory);
router.get('/dashboard', InventoryController.getDashboardStats);

module.exports = router;