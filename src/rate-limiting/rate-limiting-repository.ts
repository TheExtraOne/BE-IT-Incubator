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
    const query = RateLimitModelClass.countDocuments();
    query
      .where("ip", ip)
      .where("URL", url)
      .where("date", {
        $gt: subSeconds(new Date(), +SETTINGS.RATE_LIMIT_WINDOW),
      });

    return await query;
  },
};

export default rateLimitingRepository;
