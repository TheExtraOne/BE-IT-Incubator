import mongoose from "mongoose";
import RateLimitingRepViewModel from "../types/RateLimitingRepViewModel";

const rateLimitSchema = new mongoose.Schema<RateLimitingRepViewModel>({
  ip: { type: String, required: true },
  URL: { type: String, required: true },
  date: { type: Date, required: true },
});

// Create TTL index on the date field
rateLimitSchema.index({ date: 1 }, { expireAfterSeconds: 20 }); // Documents will be removed 20 seconds after their date field

export default rateLimitSchema;
