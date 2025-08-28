const express = require("express");
const router = express.Router();
const { User, Friend, FriendRequest, Message } = require("../models");
const Otp = require("../models/otp");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
// const { createMessage } = require("../controllers/messageController");
const {
  userSchema,
  userLoginSchema,
} = require("../validations/userValidation");
const jwt = require("jsonwebtoken");
const transporter = require("../services/emailService");
const { Op } = require("sequelize");
const { io } = require("../server");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET;

// ----------------------Hash Password Genereation---------------------------

const passwordHashed = async (pw) => {
  try {
    const hashedPassword = await bcrypt.hash(pw, 10);
    return hashedPassword;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
};

//-----------------------Register Route------------------------------

router.post("/register", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ statusCode: 400, error: error.message, data: "" });
    const { firstName, lastName, email, password } = req.body;

    console.log("req body--------", req.body);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(409).json({
        statusCode: 409,
        error: "Email is already existed!",
        data: "",
      });
    const hashPassword = await passwordHashed(password);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    // io.emit("users_update"); 
    res.status(201).json({
      statusCode: 201,
      message: "User Created Successfully",
      data: newUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, error: "Failed to register", data: "" });
  }
});

//--------------------Login Function-------------------------

const login = async (email, plainPassword) => {
  try {
    const user = await User.findOne({ where: { email } });
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!user || !isMatch) {
      return { statusCode: 401, success: false, message: "Invalid Credentials" };
    }
    return { statusCode: 200, success: true, user };
  } catch (error) {
    res.status(500).json({ statusCode: 500, error: error.message, data: "" });
  }
};

//-------------------------Login Route------------------------------

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error } = userLoginSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ statusCode: 400, error: error.message, data: "" });
    const result = await login(email, password);
    console.log("result ----------", result);

    if (!result.success) {
      return res.status(result.statusCode).json({
        statusCode: result.statusCode,
        message: result.message,
        data: "",
      });
    }

    //--------------------------without otp------------------------
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    //  // Fetch all users from DB
    // const allUsers = await User.findAll({
    //   attributes: ["id", "email"], // pick fields you want to send
    // });

    // console.log('Users===========', allUsers)
    // // Emit updated user list to all connected clients
    // io.emit("users_updated", allUsers);

    return res.status(200).json({
      statusCode: 200,
      message: "Login Successful",
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    });

    //---------------------------with otp--------------------------------------

    // const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
    // const otp = generateOTP();
    // const expires_at = new Date(Date.now() + 1 * 60000);

    // const mail = await Otp.create({ email, otp, expires_at });

    // const info = await transporter.sendMail({
    //   from: process.env.ADMIN_EMAIL,
    //   to: email,
    //   subject: "Your OTP Code",
    //   text: `Your OTP is ${otp}`
    // })

    // console.log("Information------:", info);
    // console.log("OTP saved---------", mail);

    // res.status(200).json({
    //   statusCode: 200,
    //   message: 'OTP sent to your email. Please verify to complete login.',
    //   data: { email }
    // });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, error: "Failed Login", data: "" });
  }
});

//---------------------------Verify OTP Route------------------------

router.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;
  const now = new Date();
  try {
    const detail = await Otp.findOne({ where: { otp } });

    if (!detail)
      return res
        .status(403)
        .json({ statusCode: 403, error: "Invalid OTP", data: "" });
    else if (detail.expires_at < now)
      return res
        .status(403)
        .json({ statusCode: 403, error: "OTP is expired", data: "" });
    const email = detail.email;
    await detail.destroy();

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, error: "User not found", data: "" });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      statusCode: 200,
      message: "OTP verified",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ statusCode: 500, error: "Error", data: "" });
  }
});

//--------------------------Verify Token---------------------------

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ statusCode: 401, message: "Token missing", data: "" });
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({ statusCode: 403, message: "Invalid Token", data: "" });
      req.user = user;
      next();
    });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, error: "Failed to verify token", data: "" });
  }
}

//-------------------------Protected Profile Route------------------------

router.get("/protected", verifyToken, async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ statusCode: 404, error: "User not found", data: "" });
    res
      .status(200)
      .json({ statusCode: 200, message: "User Found", data: user });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, error: "Failed to fetch users", data: "" });
  }
});

//---------------------Forgot Password Route----------------------

const generateRandomPassword = () => {
  let pass = "";
  let str =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@";

  for (let i = 1; i <= 8; i++) {
    let char = Math.floor(Math.random() * str.length + 1);

    pass += str.charAt(char);
  }

  return pass;
};

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ statusCode: 404, message: "User not found", data: user });

    const token = generateRandomPassword();
    user.resetToken = await passwordHashed(token);
    user.resetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${user.id}/${token}`;
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Password Reset",
      text: `You requested a password reset. Click the link below:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Password reset link sent to email",
      data: resetUrl,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ statusCode: 500, error: err.message, data: "" });
  }
});

//---------------------Reset Password Route----------------------

router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "User not found", data: "" });
    } else if (!user.resetToken) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "Invalid Token", data: "" });
    } else if (user.resetExpires < Date.now())
      return res
        .status(400)
        .json({ statusCode: 400, message: "Reset link expired", data: "" });

    const isValid = await bcrypt.compare(token, user.resetToken);
    if (!isValid)
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid or expired token",
        data: "",
      });

    return res
      .status(200)
      .json({ statusCode: 200, message: "Valid link", data: "" });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, message: "Server error", data: "" });
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "User not found", data: "" });
    } else if (!user.resetToken) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "Invalid Token", data: "" });
    } else if (user.resetExpires < Date.now())
      return res
        .status(400)
        .json({ statusCode: 400, message: "Reset link expired", data: "" });

    const isValid = await bcrypt.compare(token, user.resetToken);
    if (!isValid)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await passwordHashed(password);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    res.status(200).json({
      statusCode: 200,
      message: "Password reset successful",
      data: "",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, message: "Server error", data: "" });
  }
});

// -------------------------Change Password---------------------------

router.patch("/change-password", verifyToken, async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(404)
        .json({ statusCode: 404, error: "User not found", data: "" });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res
        .status(403)
        .json({ statusCode: 403, error: "Password does not match", data: "" });
    const hashedPassword = await passwordHashed(newPassword);
    await User.update({ password: hashedPassword }, { where: { email } });
    res.status(200).json({
      statusCode: 200,
      message: "Password Changed Successfully",
      data: "",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, error: "Failed to change password", data: "" });
  }
});

//----------------------Create Skills----------------------

router.post("/create-skills", async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Skill.findOne({ where: { name } });
    if (existing)
      return res.status(409).json({
        statusCode: 409,
        message: "Skill is already existed",
        data: "",
      });

    const newSkill = await Skill.create({ name });
    return res.status(201).json({
      statusCode: 201,
      message: "Skill created successfully",
      data: newSkill,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, message: "Skill not created", data: "" });
  }
});

//------------------------Get Skill------------------------

router.get("/skills", verifyToken, async (req, res) => {
  try {
    const skills = await Skill.findAll();
    if (!skills)
      return res
        .status(404)
        .json({ statusCode: 404, message: "Skill not found", data: "" });
    return res
      .status(200)
      .json({ statusCode: 200, message: "Skill found", data: skills });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, message: "Internal Server Error", data: "" });
  }
});

//-------------------------User Skills-------------------------

router.post("/user-skills", verifyToken, async (req, res) => {
  try {
    const { userId, skillIds } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      return res
        .status(404)
        .json({ statusCode: 404, message: "User not found", data: "" });

    const skills = await Skill.findAll({ where: { id: skillIds } });

    const foundSkillIds = skills.map((skill) => skill.id);

    const missingSkillIds = skillIds.filter(
      (id) => !foundSkillIds.includes(id)
    );

    if (missingSkillIds.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Some skill IDs are invalid",
        data: { missingSkillIds },
      });
    }

    const existing = await UserSkills.findOne({ where: { userId } });
    if (existing) await UserSkills.destroy({ where: { userId } });

    const records = skillIds.map((skillId) => ({ userId, skillId }));
    await UserSkills.bulkCreate(records);

    return res.status(201).json({
      statusCode: 201,
      message: "Skills saved successfully",
      data: "",
    });
  } catch (error) {
    res
      .status(500)
      .json({ statusCode: 500, message: "Failed to save skills", data: "" });
  }
});

//-----------------------------Get All Users--------------------------

router.get("/get-users", verifyToken, async (req, res) => {
  try {
    const users = await User.findAll();
    // try {
    //   const users = await User.findAll();
    //   // const userIds = users.map(user => user.id);
    return res
      .status(200)
      .json({ statusCode: 200, message: "Get all", data: users });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, message: "Failed to get users", data: "" });
  }
});

//---------------------------Get User--------------------------

router.get("/get-user/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user)
      return res
        .status(404)
        .json({ statusCode: 404, message: "User not found", data: "" });
    return res
      .status(200)
      .json({ statusCode: 200, message: "Get User", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, message: "Failed to get user", data: "" });
  }
});

//-------------------------Delete User---------------------------

router.delete("/delete-user/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (!user)
      return res
        .status(404)
        .json({ statusCode: 404, message: "User not found", data: "" });
    await User.destroy({ where: { id } });
    return res
      .status(200)
      .json({
        statusCode: 200,
        message: "User Deleted Successfully",
        data: user,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, message: "Failed to get user", data: "" });
  }
});

//-------------------------------Get Friends------------------------------

router.get("/:userId/friends", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res
      .status(400)
      .json({ statusCode: 400, message: "Missing userId in request params", data: [] });
  }
  try {
    const friends = await Friend.findAll({
      where: { userId },
      attributes: ["friendId"],
    });

    const friendIds = friends.map((f) => f.friendId);

    res
      .status(200)
      .json({
        statusCode: 200,
        message: "Friends found",
        data: friendIds,
      });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, error: "Failed to fetch friends.", data: "" });
  }
});

//------------------------------Get Friend Request-----------------------

router.get("/:userId/friend-requests", async (req, res) => {
  const { userId } = req.params;
  try {
    const incoming = await FriendRequest.findAll({
      where: { toUserId: userId, status: "pending" },
      attributes: ["fromUserId"],
    });

    const sent = await FriendRequest.findAll({
      where: { fromUserId: userId, status: "pending" },
      attributes: ["toUserId"],
    });

    if (incoming.length === 0 && sent.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "There are no pending friend requests.",
        data: {
          incoming: [],
          sent: [],
        },
      });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Friend requests fetched successfully",
      data: {
        incoming: incoming.map((r) => r.fromUserId),
        sent: sent.map((r) => r.toUserId),
      },
    });
  } catch (err) {
    res.status(500).json({ statusCode: 500, error: "Failed to fetch friend requests.", data: '' });
  }
});

//---------------------------GET /messages/:userId/:friendId----------------------
router.get("/messages/:userId/:friendId", async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { fromId: userId, toId: friendId },
          { fromId: friendId, toId: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ statusCode: 200, success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages." });
  }
});

//------------------------Upload Image-------------------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists or create it at server start
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

// POST /upload - handle image upload
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ statusCode: 400, error: "No file uploaded", data: '' });
  }

  // Return the public URL path for the uploaded image
  res.status(200).json({ statusCode: 200, success: true, imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
