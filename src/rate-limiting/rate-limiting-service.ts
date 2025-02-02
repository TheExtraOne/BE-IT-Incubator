import { ObjectId } from "mongodb";
import RateLimitingRepViewModel from "./models/RateLimitingRepViewModel";
import RateLimitingRepository from "./rate-limiting-repository";
import { HydratedDocument } from "mongoose";
import { RateLimitModelDb } from "../db/db";

class RateLimitingService {
  private rateLimitingRepository: RateLimitingRepository;

  constructor() {
    this.rateLimitingRepository = new RateLimitingRepository();
  }

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

    await this.rateLimitingRepository.saveNewRequest(requestInstance);
  }

  async getRequestsCount({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> {
    return await this.rateLimitingRepository.getRequestsCount({ ip, url });
  }
}

export default new RateLimitingService();
