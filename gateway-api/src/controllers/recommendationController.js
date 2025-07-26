const queueService = require('../services/queueService');
const Recommendation = require('../models/Recommendation'); // Importamos o modelo

// função que é 'async' para poder usar 'await'
exports.requestRecommendation = async (req, res) => {
  const { lastfm_username } = req.body;
  const userId = req.userId;

  if (!lastfm_username) {
    return res.status(400).json({ error: 'O campo lastfm_username é obrigatório.' });
  }

  try {
    // correção de bug de artistas/músicas duplicados
    // antes de enviar os novos pedidos, todas as recomendações antigas do usuário são apagadas
    await Recommendation.destroy({
      where: { userId: userId }
    });
    console.log(`Recomendações antigas do userId ${userId} foram apagadas.`);

    // prepara a mensagem para o job de artistas
    const messageArtists = {
      userId,
      lastfm_username,
      type: 'artists',
      requestedAt: new Date()
    };

    // prepara a mensagem para o job de músicas
    const messageSongs = {
      userId,
      lastfm_username,
      type: 'songs',
      requestedAt: new Date()
    };

    // publica as duas mensagens na fila
    queueService.publishToQueue('recommendation_queue', messageArtists);
    queueService.publishToQueue('recommendation_queue', messageSongs);
    
    res.status(202).json({ 
      message: 'Seu pedido de recomendações de artistas e músicas foi recebido e está sendo processado.' 
    });

  } catch (error) {
    console.error('Erro ao solicitar recomendação:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
    res.status(500).json({ error: 'Erro ao buscar recomendações.' });
  }
};

