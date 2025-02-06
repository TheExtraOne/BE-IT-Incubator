import mongoose from "mongoose";
import blogSchema from "./blog-schema";
import { SETTINGS } from "../../../common/settings";

export const BlogModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.BLOGS,
  blogSchema
);
