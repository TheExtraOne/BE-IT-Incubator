import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, RESULT_STATUS, TOKEN_TYPE } from "../../common/settings";
import jwtService from "../../adapters/jwt-service";
import { Result } from "../../common/types/types";
import usersService from "../../users/users-service";

const refreshTokenVerificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  const result: Result<string | null> = await jwtService.getUserIdByToken({
    token: refreshToken,
    type: TOKEN_TYPE.R_TOKEN,
  });

  if (result.status !== RESULT_STATUS.SUCCESS) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  const userId = result.data;
  // Check if token is in a blacklist
  const isTokenInTheBlackList = await usersService.checkIfTokenIsInTheBlackList(
    {
      id: userId!,
      token: refreshToken,
    }
  );
  if (isTokenInTheBlackList) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  req.userId = userId;

  next();
};

export default refreshTokenVerificationMiddleware;
