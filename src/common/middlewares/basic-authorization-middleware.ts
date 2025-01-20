import { Request, Response, NextFunction } from "express";
import { SETTINGS, HTTP_STATUS } from "../settings";

export const getEncodedCredentials = (data: string) =>
  Buffer.from(data, "utf8").toString("base64");

const basicAuthorizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const encodedCredentials = `Basic ${getEncodedCredentials(
    SETTINGS.ADMIN_CREDENTIALS
  )}`;
  const userEncodedCredentials = req.headers.authorization;

  if (
    !userEncodedCredentials ||
    userEncodedCredentials !== encodedCredentials
  ) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  next();
};

export default basicAuthorizationMiddleware;
