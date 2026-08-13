const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ProductController.getAll);
router.get('/low-stock', authenticate, ProductController.getLowStock);
router.get('/summary', authenticate, ProductController.getSummary);
router.get('/:id', ProductController.getById);
router.post('/', authenticate, ProductController.create);
router.put('/:id', authenticate, ProductController.update);
router.delete('/:id', authenticate, ProductController.delete);

module.exports = router;