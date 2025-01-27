import { ObjectId } from "mongodb";
import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import { rateLimitingCollection } from "../db/db";
import { subSeconds } from "date-fns";

// TODO: move to repository
const rateLimitingService = {
  createNewRequest: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<void> => {
    const newRequest: TRateLimitingRepViewModel = {
      _id: new ObjectId(),
      ip,
      URL: url,
      date: new Date(),
    };
    await rateLimitingCollection.insertOne(newRequest);
  },

  getRequests: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> =>
    await rateLimitingCollection.countDocuments({
      ["ip"]: ip,
      URL: url,
      date: { $gt: subSeconds(new Date(), 11) },
    }),
};

export default rateLimitingService;
