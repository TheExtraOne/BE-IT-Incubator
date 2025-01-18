import { body } from "express-validator";

const bodyPostCommentInputValidator = {
  contentValidation: body("content")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Content is a required field")
    .isLength({ min: 20, max: 300 })
    .withMessage("Incorrect length. Min = 20, max = 300"),
};

export default bodyPostCommentInputValidator;
