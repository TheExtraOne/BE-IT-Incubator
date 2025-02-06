import mongoose from "mongoose";
import postSchema from "./post-schema";
import { SETTINGS } from "../../../common/settings";

export const PostModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.POSTS,
  postSchema
);
