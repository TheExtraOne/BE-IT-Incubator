import { Response, Request, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTP_STATUS } from "../settings";
import { TAPIErrorResult } from "../types/types";

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array({
      onlyFirstError: true,
    }) as TExpressValidator[];

    const response = errorsArray.map((error) => ({
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
