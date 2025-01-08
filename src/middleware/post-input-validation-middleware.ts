import { body } from "express-validator";
import blogsRepository from "../repository/blogs-db-repository";

const postsInputValidator = {
  titleValidation: body("title")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Title is a required field")
    .isLength({ min: 1, max: 15 })
    .withMessage("Incorrect length. Min = 1, max = 15"),

  shortDescriptionValidation: body("shortDescription")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("ShortDescription is a required field")
    .isLength({ min: 1, max: 100 })
    .withMessage("Incorrect length. Min = 1, max = 100"),

  contentValidator: body("content")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Content is a required field")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Incorrect length. Min = 1, max = 1000"),

  blogIdValidator: body("blogId")
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("BlogId is a required field")
    .custom(async (value) => {
      const isBlogExist = await blogsRepository.getBlogById(value);

      if (!isBlogExist) throw new Error("BlogId does not exist");
      return !!isBlogExist;
    }),
};

export default postsInputValidator;
