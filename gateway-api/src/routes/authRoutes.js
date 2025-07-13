const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// rota protegida
// é executado antes do getProfile
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;