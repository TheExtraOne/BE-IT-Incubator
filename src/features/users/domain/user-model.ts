import mongoose from "mongoose";
import userSchema from "./user-schema";
import { SETTINGS } from "../../../common/settings";

export const UserModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.USERS,
  userSchema
);
