const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const recommendationController = require('../controllers/recommendationController');

// rota para solicitar uma nova recomendação.
// protegida pelo middleware de autenticação
router.post('/', authMiddleware, recommendationController.requestRecommendation);

module.exports = router;