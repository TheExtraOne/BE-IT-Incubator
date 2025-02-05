import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import commentSchema from "./comment-schema";

export const CommentModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.COMMENTS,
  commentSchema
);
