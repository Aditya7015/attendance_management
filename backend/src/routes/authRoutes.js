const express = require('express');
const router = express.Router();
const { login, getCurrentUser, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { loginValidation } = require('../middleware/validation');

router.post('/login', loginValidation, login);
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);

module.exports = router;