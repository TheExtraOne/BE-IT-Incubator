import { body } from "express-validator";

const bodyUserInputValidator = {
  loginValidation: body("login")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Login is a required field")
    .isLength({ min: 3, max: 10 })
    .withMessage("Incorrect length. Min = 3, max = 10")
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage("Incorrect login value"),

  passwordValidation: body("password")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Password is a required field")
    .isLength({ min: 6, max: 20 })
    .withMessage("Incorrect length. Min = 6, max = 20"),

  emailValidator: body("email")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Email is a required field"),
};

export default bodyUserInputValidator;
