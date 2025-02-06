import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, RESULT_STATUS, TOKEN_TYPE } from "../../common/settings";
import { Result } from "../../common/types/types";
import { container } from "../../composition-root";
import JwtService from "../jwt-service";
import SecurityService from "../../features/security/app/security-service";
import RefreshTokensMetaRepViewModel from "../../features/security/types/RefreshTokensMetaRepViewModel";

const jwtService = container.get<JwtService>("JwtService");
const securityService = container.get<SecurityService>("SecurityService");

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

  const refreshTokenMeta: RefreshTokensMetaRepViewModel | null =
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
