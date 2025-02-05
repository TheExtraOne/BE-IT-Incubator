import { ObjectId } from "mongodb";
import RateLimitingRepViewModel from "../types/RateLimitingRepViewModel";
import { HydratedDocument } from "mongoose";
import RateLimitingRepository from "../infrastructure/rate-limiting-repository";
import { RateLimitModelDb } from "../domain/rate-limit-model";

class RateLimitingService {
  constructor(private rateLimitingRepository: RateLimitingRepository) {}

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

export default RateLimitingService;
