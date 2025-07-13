const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // verificação do token enviado no header
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token.' });
  }
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  // verificação para saber se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    // se for válido, anexa o id do usuário na requisição e continua
    req.userId = decoded.id;
    return next();
  });
};