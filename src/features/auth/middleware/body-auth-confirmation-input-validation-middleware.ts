import { body } from "express-validator";

const bodyAuthConfirmationInputValidator = {
  confirmationCodeValidation: body("code")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Code is a required field"),
};

export default bodyAuthConfirmationInputValidator;
