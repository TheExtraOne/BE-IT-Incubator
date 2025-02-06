import mongoose from "mongoose";
import commentSchema from "./comment-schema";
import { SETTINGS } from "../../../common/settings";

export const CommentModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.COMMENTS,
  commentSchema
);
