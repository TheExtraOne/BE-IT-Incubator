import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import userSchema from "./user-schema";

export const UserModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.USERS,
  userSchema
);
