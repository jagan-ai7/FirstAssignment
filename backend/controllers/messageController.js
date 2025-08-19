const { User, Message } = require("../models");
const jwt = require("jsonwebtoken");

//--------------------------Message----------------------

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return null;
  }
};

exports.createMessage = async (token, username, content) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return new Error("error_message", "Invalid or missing token");
    }

    const [firstName, ...rest] = username.trim().split(" ");
    const lastName = rest.join(" ") || "";
    // const user = await User.findOne({where: {email: decoded.email}});

    // if (user) {
    //     throw new Error('You are the Sender');
    // }
    const foundUser = await User.findOne({ where: { firstName, lastName } });
    if (!foundUser) {
      throw new Error("User not found");
    }
    const message = await Message.create({
      content,
      UserId: foundUser.id,
    });

    return {
      id: foundUser.id,
      username: `${foundUser.firstName} ${foundUser.lastName}`,
      content: message.content,
      createdAt: message.createdAt,
    };
  } catch (err) {
    throw err;
  }
};
