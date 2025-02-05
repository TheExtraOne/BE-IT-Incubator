import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import rateLimitSchema from "./rate-limit-schema";

export const RateLimitModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.RATE_LIMITS,
  rateLimitSchema
);
