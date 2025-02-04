import mongoose from "mongoose";
import RefreshTokensMetaRepViewModel from "./RefreshTokensMetaRepViewModel";

const refreshTokenSchema = new mongoose.Schema<RefreshTokensMetaRepViewModel>({
  ip: { type: String, required: true },
  title: { type: String, required: true },
  lastActiveDate: { type: String, required: true },
  expirationDate: { type: String, required: true },
  userId: { type: String, required: true },
});

export default refreshTokenSchema;
