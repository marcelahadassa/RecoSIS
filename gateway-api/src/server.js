// carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database'); // importa a conexão com o BD
const recommendationRoutes = require('./routes/recommendationRoutes'); // importa as novas rotas
const queueService = require('./services/queueService'); // importa o serviço de fila

// importa as rotas de autenticação
const authRoutes = require('./routes/authRoutes');

const app = express();

// middleware para permitir que a API entenda requisições com corpo em JSON
app.use(express.json());

// rota de teste inicial para ver se a API está no ar
app.get('/', (req, res) => {
  res.json({ message: "Gateway de API está funcionando!" });
});

// uso das rotas que já foram definidos
// todas as rotas em authRoutes terão o prefixo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
// pega a porta do arquivo .env ou usa 3000 como padrão
const PORT = process.env.APP_PORT || 3000;

// sincronização com o banco de dados e depois dá ínicio ao servidor
sequelize.sync().then(() => {
  console.log('Conexão com o banco de dados estabelecida com sucesso.');
  
  // inicia a conexão com o RabbitMQ
  queueService.connect();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Não foi possível inicializar a aplicação:', err);
});