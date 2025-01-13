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

  sortDirectionValidator: query("sortDirection")
    .optional({ values: "undefined" })
    .custom((value) => {
      const has_error = !Object.values(SORT_DIRECTION).includes(value);
      if (has_error) throw new Error("Should be 'asc' or 'desc'");

      return !has_error;
    }),
};

export default queryInputValidator;
