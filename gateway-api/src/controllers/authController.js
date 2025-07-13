const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// route: POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      password: hashedPassword,
    });
    
    user.password = undefined;
    res.status(201).json({ user });

  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
};

// route: POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ token });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
};

// route: GET /api/auth/me
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário do token não encontrado.' });
    }
    
    user.password = undefined;
    res.status(200).json({ user });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
};