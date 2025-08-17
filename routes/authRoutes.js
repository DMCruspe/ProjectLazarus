const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authLimiter = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authController.login);

module.exports = router;