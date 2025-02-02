import { Response, Request } from "express";
import { HTTP_STATUS } from "../common/settings";
import TRefreshTokenMetaControllerViewModel from "./models/RefreshTokenMetaControllerViewModel";
import securityQueryRepository from "./security-query-repository";
import { Result, TRequestWithParams } from "../common/types/types";
import TPathParamsRefreshTokenMetaModel from "./models/PathParamsRefreshTokenMetaModel";
import RefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import securityService from "./security-service";
import jwtService from "../adapters/jwt-service";

class SecurityController {
  async getRefreshTokensMeta(req: Request, res: Response) {
    // Validating userId in the middleware
    const userId: string | null = req.userId;
    const devices: TRefreshTokenMetaControllerViewModel[] =
      await securityQueryRepository.getAllRefreshTokensMetaByUserId(userId!);

    res.status(HTTP_STATUS.OK_200).json(devices);
  }

  async deleteRefreshTokenMetaByDeviceId(
    req: TRequestWithParams<TPathParamsRefreshTokenMetaModel>,
    res: Response
  ) {
    const { deviceId } = req.params;
    const userId: string | null = req.userId;

    const refreshTokenMeta: RefreshTokensMetaRepViewModel | null =
      await securityService.getRefreshTokenMetaByFilters({ deviceId });

    if (!refreshTokenMeta) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    if (refreshTokenMeta.userId !== userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    securityService.deleteRefreshTokenMetaByDeviceId(deviceId);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async deleteAllRefreshTokensMeta(req: Request, res: Response) {
    const refreshToken: string = req.cookies.refreshToken;
    const result: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await jwtService.decodeToken(refreshToken!);
    const { userId, deviceId } = result.data || {};

    securityService.deleteAllRefreshTokensMeta({
      userId: userId!,
      deviceId: deviceId!,
    });

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}

export default new SecurityController();
