const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 15] },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 15] },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [5] },
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

User.associate = (models) => {
  User.hasMany(models.Message, { foreignKey: "UserId" });
};

module.exports = User;
