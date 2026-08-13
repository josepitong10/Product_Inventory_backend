const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplier.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', SupplierController.getAll);
router.post('/', authenticate, SupplierController.create);

module.exports = router;