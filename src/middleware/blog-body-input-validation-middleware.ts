import { body } from "express-validator";

const blogBodyInputValidator = {
  nameValidation: body("name")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Name is a required field")
    .isLength({ min: 1, max: 15 })
    .withMessage("Incorrect length. Min = 1, max = 15"),

  descriptionValidation: body("description")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Description is a required field")
    .isLength({ min: 1, max: 500 })
    .withMessage("Incorrect length. Min = 1, max = 500"),

  websiteUrlValidation: body("websiteUrl")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("WebsiteUrl is a required field")
    .isLength({ min: 1, max: 100 })
    .withMessage("Incorrect length. Min = 1, max = 100")
    .custom((value) => {
      const regex =
        /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
      const isMatching = regex.test(value);

      if (!isMatching) throw new Error("Incorrect URL value");
      return isMatching;
    }),
};

export default blogBodyInputValidator;
