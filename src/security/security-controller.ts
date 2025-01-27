import { Response, Request } from "express";
import { HTTP_STATUS } from "../common/settings";
import TRefreshTokenMetaControllerViewModel from "./models/RefreshTokenMetaControllerViewModel";
import securityQueryRepository from "./security-query-repository";
import { TRequestWithParams } from "../common/types/types";
import TPathParamsRefreshTokenMetaModel from "./models/PathParamsRefreshTokenMetaModel";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import securityService from "./security-service";
import jwtService from "../adapters/jwt-service";

const securityController = {
  getRefreshTokensMeta: async (req: Request, res: Response) => {
    const userId = req.userId;
    const devices: TRefreshTokenMetaControllerViewModel[] =
      await securityQueryRepository.getAllRefreshTokensMeta({
        ["userId"]: userId!,
      });

    res.status(HTTP_STATUS.OK_200).json(devices);
  },

  deleteRefreshTokenMetaByDeviceId: async (
    req: TRequestWithParams<TPathParamsRefreshTokenMetaModel>,
    res: Response
  ) => {
    const { deviceId } = req.params;
    const userId = req.userId;

    const refreshTokenMeta: TRefreshTokensMetaRepViewModel | null =
      await securityService.getRefreshTokenMetaByFilters({
        ["deviceId"]: deviceId,
      });

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
  },

  deleteAllRefreshTokensMeta: async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const result = await jwtService.decodeToken(refreshToken!);
    const { userId, deviceId } = result.data || {};

    securityService.deleteAllRefreshTokensMeta({
      userId: userId!,
      deviceId: deviceId!,
    });

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },
};

export default securityController;
