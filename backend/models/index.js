const User = require("./User");
const Message = require("./Message");
const Friend = require("./Friend");
const FriendRequest = require("./FriendRequest");

// Friendships (self-referencing many-to-many)
User.belongsToMany(User, {
  as: "Friends",
  through: Friend,
  foreignKey: "userId",
  otherKey: "friendId",
});

// Messages (bi-directional)
User.hasMany(Message, { foreignKey: "fromId", as: "SentMessages" });
User.hasMany(Message, { foreignKey: "toId", as: "ReceivedMessages" });

Message.belongsTo(User, { foreignKey: "fromId", as: "Sender" });
Message.belongsTo(User, { foreignKey: "toId", as: "Receiver" });

// Friend Requests
User.hasMany(FriendRequest, { foreignKey: "fromUserId", as: "SentRequests" });
User.hasMany(FriendRequest, { foreignKey: "toUserId", as: "ReceivedRequests" });

FriendRequest.belongsTo(User, { foreignKey: "fromUserId", as: "FromUser" });
FriendRequest.belongsTo(User, { foreignKey: "toUserId", as: "ToUser" });

module.exports = {
  User,
  Message,
  Friend,
  FriendRequest,
};


// const User = require("./User");
// const Message = require("./Message");

// User.hasMany(Message, { foreignKey: "UserId" });
// Message.belongsTo(User, { foreignKey: "UserId" });
// module.exports = { User, Message }

//---------------------userskills----------------

// const Skill = require("./Skill");
// const UserSkills = require("./UserSkills");

// User.belongsToMany(Skill, {
//   through: UserSkills,
//   foreignKey: "userId",
//   otherKey: "skillId",
// });

// Skill.belongsToMany(User, {
//   through: UserSkills,
//   foreignKey: "skillId",
//   otherKey: "userId",
// });
// module.exports = { User, Skill, UserSkills, Message };
