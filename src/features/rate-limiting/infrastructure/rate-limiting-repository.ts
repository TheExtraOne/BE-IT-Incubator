import { subSeconds } from "date-fns";
import { HydratedDocument } from "mongoose";
import RateLimitingRepViewModel from "../types/RateLimitingRepViewModel";
import { RateLimitModelDb } from "../domain/rate-limit-model";
import { injectable } from "inversify";
import { SETTINGS } from "../../../common/settings";

@injectable()
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
