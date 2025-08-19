const User = require("./User");
const Skill = require("./Skill");
const Message = require("./Message");
const UserSkills = require("./UserSkills");

User.belongsToMany(Skill, {
  through: UserSkills,
  foreignKey: "userId",
  otherKey: "skillId",
});

Skill.belongsToMany(User, {
  through: UserSkills,
  foreignKey: "skillId",
  otherKey: "userId",
});

User.hasMany(Message, { foreignKey: "UserId" });
Message.belongsTo(User, { foreignKey: "UserId" });

module.exports = { User, Skill, UserSkills, Message };
