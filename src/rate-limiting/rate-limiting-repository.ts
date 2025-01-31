import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import { RateLimitModelClass } from "../db/db";
import { subSeconds } from "date-fns";
import { SETTINGS } from "../common/settings";
import { HydratedDocument } from "mongoose";

const rateLimitingRepository = {
  saveNewRequest: async (
    newRequest: HydratedDocument<TRateLimitingRepViewModel>
  ): Promise<void> => {
    await newRequest.save();
  },

  getRequestsCount: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> => {
    return await RateLimitModelClass.countDocuments()
      .where("ip", ip)
      .where("URL", url)
      .where("date", {
        $gt: subSeconds(new Date(), +SETTINGS.RATE_LIMIT_WINDOW),
      });
  },
};

export default rateLimitingRepository;
