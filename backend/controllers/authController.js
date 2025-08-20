const passwordHashed = require('../services/passwordHashed');
const { userSchema } = require('../validations/userValidation');

const register = async (req, res) => {
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
      return res
        .status(409)
        .json({
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
    res
      .status(201)
      .json({
        statusCode: 201,
        message: "User Created Successfully",
        data: newUser,
      });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, error: "Failed to register", data: "" });
  }
};

module.exports = { register };