const queueService = require('../services/queueService');

exports.requestRecommendation = (req, res) => {
  const { lastfm_username } = req.body;
  const userId = req.userId; //id do token 

  if (!lastfm_username) {
    return res.status(400).json({ error: 'O campo lastfm_username é obrigatório.' });
  }

  // mensagem que será enviada para a fila
  const message = {
    userId,
    lastfm_username,
    requestedAt: new Date()
  };

  // publica a mensagem na fila
  queueService.publishToQueue('recommendation_queue', message);
  
  // respota ao usuário que o pedido foi recebido
  res.status(202).json({ 
    message: 'Seu pedido de recomendação foi recebido e está sendo processado.' 
  });
};