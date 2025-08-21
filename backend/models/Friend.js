const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Friend = sequelize.define("Friend", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  friendId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
});

module.exports = Friend;