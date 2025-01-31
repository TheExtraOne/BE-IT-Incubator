import { ObjectId } from "mongodb";
import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import rateLimitingRepository from "./rate-limiting-repository";
import { HydratedDocument } from "mongoose";
import { RateLimitModelClass } from "../db/db";

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

    const requestInstance: HydratedDocument<TRateLimitingRepViewModel> =
      new RateLimitModelClass(newRequest);

    await rateLimitingRepository.saveNewRequest(requestInstance);
  },

  getRequestsCount: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> =>
    await rateLimitingRepository.getRequestsCount({ ip, url }),
};

export default rateLimitingService;
