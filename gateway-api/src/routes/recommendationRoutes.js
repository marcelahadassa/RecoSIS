const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const recommendationController = require('../controllers/recommendationController');

// rota para solicitar uma nova recomendação.
// protegida pelo middleware de autenticação
router.post('/', authMiddleware, recommendationController.requestRecommendation);
// Rota nova, para BUSCAR as recomendações que já estão prontas no banco
router.get('/', authMiddleware, recommendationController.getRecommendations);
module.exports = router;


//upar