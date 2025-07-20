const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Recommendation = sequelize.define('Recommendation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  item_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
});

// associa os modelos
User.hasMany(Recommendation, { foreignKey: 'userId' });
Recommendation.belongsTo(User, { foreignKey: 'userId' });

module.exports = Recommendation;