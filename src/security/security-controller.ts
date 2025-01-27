import { Response, Request } from "express";
import { HTTP_STATUS } from "../common/settings";
import TDeviceControllerViewModel from "./models/DeviceControllerViewModel";

const securityController = {
  getDevices: async (req: Request, res: Response) => {
    // Check if authorized in the middlewares
    // ...
    // Call service
    const devices: TDeviceControllerViewModel[] = [
      {
        ip: "12323",
        title: "Chrome 105",
        lastActiveDate: "Some date",
        deviceId: "1888",
      },
    ];
    //   await securityQueryRepository.getDevices();

    res.status(HTTP_STATUS.OK_200).json(devices);
  },
};

export default securityController;
