import mongoose from "mongoose";
import likeSchema from "./like-schema";
import { SETTINGS } from "../../../common/settings";

export const LikeModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.LIKES,
  likeSchema
);
