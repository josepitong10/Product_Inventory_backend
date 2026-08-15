const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplier.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET
router.get('/', SupplierController.getAll);
router.get('/:id', SupplierController.getById);

// CREATE
router.post('/', SupplierController.create);

// UPDATE
router.put('/:id', SupplierController.update);

// DELETE
router.delete('/:id', SupplierController.delete);

module.exports = router;