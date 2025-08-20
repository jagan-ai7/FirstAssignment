const User = require("./User");
const Message = require("./Message");

User.hasMany(Message, { foreignKey: "UserId" });
Message.belongsTo(User, { foreignKey: "UserId" });
module.exports = { User, Message }

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
