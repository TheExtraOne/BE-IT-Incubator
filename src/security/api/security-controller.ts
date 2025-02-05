import { Response, Request } from "express";
import JwtService from "../../adapters/jwt-service";
import { HTTP_STATUS } from "../../common/settings";
import { Result, TRequestWithParams } from "../../common/types/types";
import SecurityService from "../app/security-service";
import TPathParamsRefreshTokenMetaModel from "../types/PathParamsRefreshTokenMetaModel";
import TRefreshTokenMetaControllerViewModel from "../types/RefreshTokenMetaControllerViewModel";
import RefreshTokensMetaRepViewModel from "../types/RefreshTokensMetaRepViewModel";
import SecurityQueryRepository from "../infrastructure/security-query-repository";

class SecurityController {
  constructor(
    private jwtService: JwtService,
    private securityQueryRepository: SecurityQueryRepository,
    private securityService: SecurityService
  ) {}

  async getRefreshTokensMeta(req: Request, res: Response) {
    // Validating userId in the middleware
    const userId: string | null = req.userId;
    const devices: TRefreshTokenMetaControllerViewModel[] =
      await this.securityQueryRepository.getAllRefreshTokensMetaByUserId(
        userId!
      );

    res.status(HTTP_STATUS.OK_200).json(devices);
  }

  async deleteRefreshTokenMetaByDeviceId(
    req: TRequestWithParams<TPathParamsRefreshTokenMetaModel>,
    res: Response
  ) {
    const { deviceId } = req.params;
    const userId: string | null = req.userId;

    const refreshTokenMeta: RefreshTokensMetaRepViewModel | null =
      await this.securityService.getRefreshTokenMetaByFilters({ deviceId });

    if (!refreshTokenMeta) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    if (refreshTokenMeta.userId !== userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    this.securityService.deleteRefreshTokenMetaByDeviceId(deviceId);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async deleteAllRefreshTokensMeta(req: Request, res: Response) {
    const refreshToken: string = req.cookies.refreshToken;
    const result: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await this.jwtService.decodeToken(refreshToken!);
    const { userId, deviceId } = result.data || {};

    this.securityService.deleteAllRefreshTokensMeta({
      userId: userId!,
      deviceId: deviceId!,
    });

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}

export default SecurityController;
