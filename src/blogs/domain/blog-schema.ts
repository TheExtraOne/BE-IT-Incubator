import mongoose from "mongoose";
import BlogRepViewModel from "../types/BlogRepViewModel";

const blogSchema = new mongoose.Schema<BlogRepViewModel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, required: true },
});

export default blogSchema;
