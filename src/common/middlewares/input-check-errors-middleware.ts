import { Response, Request, NextFunction } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import { HTTP_STATUS } from "../settings";
import { TAPIErrorResult, TExtension } from "../types/types";

type TExpressValidator = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

const inputCheckErrorsMiddleware = (
  req: Request,
  res: Response<TAPIErrorResult>,
  next: NextFunction
) => {
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array({
      onlyFirstError: true,
    }) as TExpressValidator[];

    const response: TExtension[] = errorsArray.map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    res.status(HTTP_STATUS.BAD_REQUEST_400).json({
      errorsMessages: response,
    });

    return;
  }

  next();
};

export default inputCheckErrorsMiddleware;
