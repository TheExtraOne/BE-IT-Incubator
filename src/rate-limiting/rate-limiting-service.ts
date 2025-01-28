import { ObjectId } from "mongodb";
import TRateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import rateLimitingRepository from "./rate-limiting-repository";

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

    await rateLimitingRepository.insertNewRequest(newRequest);
  },

  getRequests: async ({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> =>
    await rateLimitingRepository.getRequestsAmount({ ip, url }),
};

export default rateLimitingService;
