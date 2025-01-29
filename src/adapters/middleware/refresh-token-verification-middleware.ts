import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, RESULT_STATUS, TOKEN_TYPE } from "../../common/settings";
import jwtService from "../../adapters/jwt-service";
import { Result } from "../../common/types/types";
import TRefreshTokensMetaRepViewModel from "../../security/models/RefreshTokensMetaRepViewModel";
import securityService from "../../security/security-service";

const refreshTokenVerificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken: string | undefined = req.cookies.refreshToken;
  if (!refreshToken) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  const result: Result<string | null> = await jwtService.verifyToken({
    token: refreshToken,
    type: TOKEN_TYPE.R_TOKEN,
  });

  if (result.status !== RESULT_STATUS.SUCCESS) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }

  const resultDecode: Result<{
    iat?: number;
    exp?: number;
    userId?: string;
    deviceId?: string;
  } | null> = await jwtService.decodeToken(refreshToken);
  const { userId, deviceId, iat } = resultDecode?.data || {};

  const refreshTokenMeta: TRefreshTokensMetaRepViewModel | null =
    await securityService.getRefreshTokenMetaByFilters({
      userId: userId!,
      deviceId: deviceId!,
      lastActiveDate: securityService.convertTimeToISOFromUnix(iat!)!,
    });

  if (!refreshTokenMeta) {
    res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
    return;
  }
  req.userId = userId!;

  next();
};

export default refreshTokenVerificationMiddleware;
