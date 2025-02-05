import { subSeconds } from "date-fns";
import { HydratedDocument } from "mongoose";
import { SETTINGS } from "../../common/settings";
import RateLimitingRepViewModel from "../types/RateLimitingRepViewModel";
import { RateLimitModelDb } from "../domain/rate-limit-model";

class RateLimitingRepository {
  async saveNewRequest(
    newRequest: HydratedDocument<RateLimitingRepViewModel>
  ): Promise<void> {
    await newRequest.save();
  }

  async getRequestsCount({
    ip,
    url,
  }: {
    ip: string;
    url: string;
  }): Promise<number> {
    return await RateLimitModelDb.countDocuments()
      .where("ip", ip)
      .where("URL", url)
      .where("date", {
        $gt: subSeconds(new Date(), +SETTINGS.RATE_LIMIT_WINDOW),
      });
  }
}

export default RateLimitingRepository;
