import { body } from "express-validator";

const bodyAuthNewPasswordInputValidator = {
  newPasswordValidation: body("newPassword")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("New password is a required field")
    .isLength({ min: 6, max: 20 })
    .withMessage("Incorrect length. Min = 6, max = 20"),

  recoveryCodeValidation: body("recoveryCode")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Recovery code is a required field"),
};

export default bodyAuthNewPasswordInputValidator;
