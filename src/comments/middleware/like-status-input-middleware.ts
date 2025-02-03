import { body } from "express-validator";
import { LIKE_STATUS } from "../../common/settings";

const likeStatusInputValidator = {
  likeStatusValidation: body("likeStatus")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("LikeStatus is a required field")
    .isIn(Object.values(LIKE_STATUS))
    .withMessage(
      `Incorrect value. Value must be ${Object.values(LIKE_STATUS)}`
    ),
};

export default likeStatusInputValidator;
