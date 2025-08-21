const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FriendRequest = sequelize.define("FriendRequest", {
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
  },
});

module.exports = FriendRequest;