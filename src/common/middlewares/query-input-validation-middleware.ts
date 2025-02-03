import { query } from "express-validator";
import { SORT_DIRECTION } from "../settings";

const queryInputValidator = {
  pageNumberValidator: query("pageNumber")
    .optional({ values: "undefined" })
    .custom((value) => {
      const convertedValue = +value;
      const errors = [!Number.isInteger(convertedValue), convertedValue < 1];

      if (errors[0]) {
        throw new Error("Should be an integer");
      }
      if (errors[1]) {
        throw new Error("Minimum allowed value is 1");
      }

      return !errors.includes(true);
    }),

  pageSizeValidator: query("pageSize")
    .optional({ values: "undefined" })
    .custom((value) => {
      const convertedValue = +value;
      const errors = [!Number.isInteger(convertedValue), convertedValue < 1];

      if (errors[0]) throw new Error("Should be an integer");
      if (errors[1]) throw new Error("Minimum allowed value is 1");

      return !errors.includes(true);
    }),

  sortByValidator: query("sortBy")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Can't be an empty string"),

  searchNameTermValidator: query("searchNameTerm")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Can't be an empty string"),

  searchLoginTermValidator: query("searchLoginTerm")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Can't be an empty string"),

  searchEmailTermValidator: query("searchEmailTerm")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Incorrect type")
    .trim()
    .notEmpty()
    .withMessage("Can't be an empty string"),

  sortDirectionValidator: query("sortDirection")
    .optional({ values: "undefined" })
    .isIn(Object.values(SORT_DIRECTION))
    .withMessage(
      `Incorrect value. Value must be ${Object.values(SORT_DIRECTION)}`
    ),
};

export default queryInputValidator;
