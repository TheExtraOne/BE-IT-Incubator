import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../common/settings";
import jwtService from "../jwt-service";

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

  const userId: string | null = await jwtService.getUserIdByToken(token);

  if (!userId) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }
  req.userId = userId;

  next();
};

export default authJwtMiddleware;
