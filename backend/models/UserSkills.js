const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSkills = sequelize.define('UserSkills', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = UserSkills;