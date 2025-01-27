import { Response, Request } from "express";
import { HTTP_STATUS } from "../common/settings";
import TRefreshTokenMetaControllerViewModel from "./models/RefreshTokenMetaControllerViewModel";
import securityQueryRepository from "./security-query-repository";
import { TRequestWithParams } from "../common/types/types";
import TPathParamsRefreshTokenMetaModel from "./models/PathParamsRefreshTokenMetaModel";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import securityService from "./security-service";

const securityController = {
  getRefreshTokensMeta: async (_req: Request, res: Response) => {
    const devices: TRefreshTokenMetaControllerViewModel[] =
      await securityQueryRepository.getAllRefreshTokensMeta();

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
        filter: { deviceId },
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
};

export default securityController;
