import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import { rateLimitingCollection } from "../db/db";
import { subSeconds } from "date-fns";
import { SETTINGS } from "../common/settings";

const rateLimitingRepository = {
  insertNewRequest: async (newRequest: TRateLimitingRepViewModel) =>
    await rateLimitingCollection.insertOne(newRequest),

  getRequestsAmount: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> =>
    await rateLimitingCollection.countDocuments({
      ["ip"]: ip,
      URL: url,
      date: { $gt: subSeconds(new Date(), +SETTINGS.RATE_LIMIT_WINDOW) },
    }),
};

export default rateLimitingRepository;
