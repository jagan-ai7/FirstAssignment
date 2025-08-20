const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.associate = (models) => {
  Message.belongsTo(models.User, {
    foreignKey: "UserId",
    onDelete: "CASCADE",
  });
};

module.exports = Message;
