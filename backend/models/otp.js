const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Otp = sequelize.define('Otp', {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
    otp: { type: DataTypes.STRING, allowNull: false, validate: { len: [5] } },
    expires_at: { type: DataTypes.DATE, allowNull: false }
});

module.exports = Otp;