import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import likeSchema from "./like-schema";

export const LikeModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.LIKES,
  likeSchema
);
