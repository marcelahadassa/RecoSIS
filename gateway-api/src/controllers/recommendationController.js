const queueService = require('../services/queueService');

exports.requestRecommendation = (req, res) => {
  const { lastfm_username } = req.body;
  const userId = req.userId; // Este ID vem do token

  if (!lastfm_username) {
    return res.status(400).json({ error: 'O campo lastfm_username é obrigatório.' });
  }

  // --- LÓGICA ATUALIZADA ---

  // 1. Prepara a mensagem para o trabalho de 'artistas'
  const messageArtists = {
    userId,
    lastfm_username,
    type: 'artists', // Definimos o tipo diretamente no código
    requestedAt: new Date()
  };

  // 2. Prepara a mensagem para o trabalho de 'músicas'
  const messageSongs = {
    userId,
    lastfm_username,
    type: 'songs', // Definimos o tipo diretamente no código
    requestedAt: new Date()
  };

  // 3. Publica as duas mensagens na fila, uma para cada tipo de trabalho
  queueService.publishToQueue('recommendation_queue', messageArtists);
  queueService.publishToQueue('recommendation_queue', messageSongs);
  
  // A resposta para o usuário agora pode ser um pouco mais específica
  res.status(202).json({ 
    message: 'Seu pedido de recomendações de artistas e músicas foi recebido e está sendo processado.' 
  });
};