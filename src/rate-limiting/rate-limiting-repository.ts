import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import { RateLimitModel } from "../db/db";
import { subSeconds } from "date-fns";
import { SETTINGS } from "../common/settings";

const rateLimitingRepository = {
  insertNewRequest: async (
    newRequest: TRateLimitingRepViewModel
  ): Promise<string> => {
    const { _id: insertedId } = await RateLimitModel.create(newRequest);

    return insertedId.toString();
  },

  getRequestsAmount: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> =>
    await RateLimitModel.countDocuments({
      ["ip"]: ip,
      URL: url,
      date: { $gt: subSeconds(new Date(), +SETTINGS.RATE_LIMIT_WINDOW) },
    }),
};

export default rateLimitingRepository;
