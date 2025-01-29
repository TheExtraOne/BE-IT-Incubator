import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, RESULT_STATUS, TOKEN_TYPE } from "../../common/settings";
import jwtService from "../../adapters/jwt-service";
import { Result } from "../../common/types/types";

const accessTokenVerificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerJWT: string | undefined = req.headers.authorization;
  if (!bearerJWT) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  const accessToken: string = bearerJWT.split(" ")[1];
  const result: Result<string | null> = await jwtService.verifyToken({
    token: accessToken,
    type: TOKEN_TYPE.AC_TOKEN,
  });

  if (result.status !== RESULT_STATUS.SUCCESS) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }
  const userId = result.data!;
  req.userId = userId;

  next();
};

export default accessTokenVerificationMiddleware;
