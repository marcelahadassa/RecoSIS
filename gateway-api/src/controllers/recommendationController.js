const queueService = require('../services/queueService');
const Recommendation = require('../models/Recommendation'); // <-- NOVO import do modelo

exports.requestRecommendation = (req, res) => {
  const { lastfm_username } = req.body;
  const userId = req.userId; // Este ID vem do token

  if (!lastfm_username) {
    return res.status(400).json({ error: 'O campo lastfm_username é obrigatório.' });
  }

  // prepação da mensagem para o job de artistas
  const messageArtists = {
    userId,
    lastfm_username,
    type: 'artists',
    requestedAt: new Date()
  };

  // preparação da mensagem para o job de músicas
  const messageSongs = {
    userId,
    lastfm_username,
    type: 'songs',
    requestedAt: new Date()
  };

  // publica as duas mensagens na fila
  queueService.publishToQueue('recommendation_queue', messageArtists);
  queueService.publishToQueue('recommendation_queue', messageSongs);
  
  // resposta para o usuário
  res.status(202).json({ 
    message: 'Seu pedido de recomendações de artistas e músicas foi recebido e está sendo processado.' 
  });
};


// função que será chamada pelo frontend para buscar os resultados prontos
exports.getRecommendations = async (req, res) => {
  try {
    // busca no banco de dados todas as recomendações para o usuário logado
    const recommendations = await Recommendation.findAll({
      where: { userId: req.userId }, // filtra pelo ID do usuário do token
      order: [['createdAt', 'DESC']] // ordena pelas mais recentes
    });
    
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
    res.status(500).json({ error: 'Erro ao buscar recomendações.' });
  }
};

//upar