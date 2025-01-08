import { Request, Response, NextFunction } from "express";
import { SETTINGS, STATUS } from "../settings";

export const getEncodedCredentials = (data: string) =>
  Buffer.from(data, "utf8").toString("base64");

const authorizationMiddleware = (
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
    res.sendStatus(STATUS.UNAUTHORIZED_401);
    return;
  }

  next();
};

export default authorizationMiddleware;
