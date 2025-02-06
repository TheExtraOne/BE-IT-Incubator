import { Request, Response, NextFunction } from "express";
import { RESULT_STATUS, TOKEN_TYPE } from "../../common/settings";
import JwtService from "../../adapters/jwt-service";
import { Result } from "../../common/types/types";

const optionalAccessTokenVerificationMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const bearerJWT: string | undefined = req.headers.authorization;
  if (!bearerJWT) {
    next();
    return;
  }

  const accessToken: string = bearerJWT!.split(" ")[1];
  const result: Result<string | null> = await new JwtService().verifyToken({
    token: accessToken,
    type: TOKEN_TYPE.AC_TOKEN,
  });

  if (result.status !== RESULT_STATUS.SUCCESS) {
    next();
    return;
  }

  const userId = result.data!;
  req.userId = userId;

  next();
};

export default optionalAccessTokenVerificationMiddleware;
