import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import postSchema from "./post-schema";

export const PostModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.POSTS,
  postSchema
);
