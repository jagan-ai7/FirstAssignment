const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().min(2).max(15).required(),
    lastName: Joi.string().min(2).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
});

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
});
module.exports = {userSchema, userLoginSchema};