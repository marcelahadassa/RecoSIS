const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {

  email: {
    type: DataTypes.STRING,
    allowNull: false, // o campo não pode ser nulo
    unique: true, // garante que não haverá dois emails iguais
    validate: {
      isEmail: true // valida se o formato é de um email
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
  // os campos 'createdAt' e 'updatedAt' são criados automaticamente
});

module.exports = User;