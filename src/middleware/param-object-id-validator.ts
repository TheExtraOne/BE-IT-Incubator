import { param } from "express-validator";

const paramObjectIdValidator = param("id")
  .isMongoId()
  .withMessage("Incorrect type");

export default paramObjectIdValidator;
