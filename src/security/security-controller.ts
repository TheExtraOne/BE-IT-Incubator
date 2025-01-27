import { Response, Request } from "express";
import { HTTP_STATUS } from "../common/settings";
import TDeviceControllerViewModel from "./models/DeviceControllerViewModel";
import securityQueryRepository from "./security-query-repository";

const securityController = {
  getDevices: async (req: Request, res: Response) => {
    const devices: TDeviceControllerViewModel[] =
      await securityQueryRepository.getAllRefreshTokensMeta();

    res.status(HTTP_STATUS.OK_200).json(devices);
  },
};

export default securityController;
