const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', CategoryController.getAll);
router.post('/', authenticate, CategoryController.create);

module.exports = router;