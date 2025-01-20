import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, RESULT_STATUS } from "../../common/settings";
import jwtService from "../jwt-service";
import { Result } from "../../common/types/types";

const authJwtMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerJWT = req.headers.authorization;
  if (!bearerJWT) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  const token: string = bearerJWT.split(" ")[1];

  const result: Result<string | null> = await jwtService.getUserIdByToken(
    token
  );

  if (result.status !== RESULT_STATUS.SUCCESS) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }
  req.userId = result.data;

  next();
};

export default authJwtMiddleware;
