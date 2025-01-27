import { Response, Request } from "express";
import { HTTP_STATUS } from "../common/settings";
import TRefreshTokenMetaControllerViewModel from "./models/RefreshTokenMetaControllerViewModel";
import securityQueryRepository from "./security-query-repository";

const securityController = {
  getDevices: async (_req: Request, res: Response) => {
    const devices: TRefreshTokenMetaControllerViewModel[] =
      await securityQueryRepository.getAllRefreshTokensMeta();

    res.status(HTTP_STATUS.OK_200).json(devices);
  },
};

export default securityController;
