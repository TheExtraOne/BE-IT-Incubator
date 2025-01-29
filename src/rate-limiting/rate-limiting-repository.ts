import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import { RateLimitModelClass } from "../db/db";
import { subSeconds } from "date-fns";
import { SETTINGS } from "../common/settings";

const rateLimitingRepository = {
  insertNewRequest: async (
    newRequest: TRateLimitingRepViewModel
  ): Promise<string> => {
    const { _id: insertedId } = await RateLimitModelClass.create(newRequest);

    return insertedId.toString();
  },

  getRequestsAmount: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> =>
    await RateLimitModelClass.countDocuments({
      ["ip"]: ip,
      URL: url,
      date: { $gt: subSeconds(new Date(), +SETTINGS.RATE_LIMIT_WINDOW) },
    }),
};

export default rateLimitingRepository;
