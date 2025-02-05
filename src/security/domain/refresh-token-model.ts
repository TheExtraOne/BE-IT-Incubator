import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import refreshTokenSchema from "./refresh-token-schema";

export const RefreshTokenModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.REFRESH_TOKENS,
  refreshTokenSchema
);
