import mongoose from "mongoose";
import refreshTokenSchema from "./refresh-token-schema";
import { SETTINGS } from "../../../common/settings";

export const RefreshTokenModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.REFRESH_TOKENS,
  refreshTokenSchema
);
