const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', AuthController.me);

module.exports = router;