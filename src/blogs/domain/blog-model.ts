import mongoose from "mongoose";
import { SETTINGS } from "../../common/settings";
import blogSchema from "./blog-schema";

export const BlogModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.BLOGS,
  blogSchema
);
