const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fromId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  toId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("text", "image"),
    defaultValue: "text",
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Message;



// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const Message = sequelize.define("Message", {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   content: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// Message.associate = (models) => {
//   Message.belongsTo(models.User, {
//     foreignKey: "UserId",
//     onDelete: "CASCADE",
//   });
// };

// module.exports = Message;
