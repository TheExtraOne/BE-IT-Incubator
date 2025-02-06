import mongoose from "mongoose";
import rateLimitSchema from "./rate-limit-schema";
import { SETTINGS } from "../../../common/settings";

export const RateLimitModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.RATE_LIMITS,
  rateLimitSchema
);
