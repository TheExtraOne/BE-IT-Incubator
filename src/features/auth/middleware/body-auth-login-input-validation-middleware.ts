import { body } from "express-validator";

const bodyAuthLoginInputValidator = {
  loginOrEmailValidation: body("loginOrEmail")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("loginOrEmail is a required field"),

  passwordValidation: body("password")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Password is a required field"),
};

export default bodyAuthLoginInputValidator;
