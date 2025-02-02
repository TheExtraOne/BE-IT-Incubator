import { ObjectId } from "mongodb";
import RateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import rateLimitingRepository from "./rate-limiting-repository";
import { HydratedDocument } from "mongoose";
import { RateLimitModelDb } from "../db/db";

class RateLimitingService {
  async createNewRequest({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<void> {
    const newRequest: RateLimitingRepViewModel = new RateLimitingRepViewModel(
      new ObjectId(),
      ip,
      url,
      new Date()
    );

    const requestInstance: HydratedDocument<RateLimitingRepViewModel> =
      new RateLimitModelDb(newRequest);

    await rateLimitingRepository.saveNewRequest(requestInstance);
  }

  async getRequestsCount({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> {
    return await rateLimitingRepository.getRequestsCount({ ip, url });
  }
}

export default new RateLimitingService();
