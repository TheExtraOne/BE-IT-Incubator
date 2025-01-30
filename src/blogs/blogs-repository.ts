import { ObjectId } from "mongodb";
import TBlogRepViewModel from "./models/BlogRepViewModel";
import { BlogModelClass } from "../db/db";
import { HydratedDocument } from "mongoose";

const blogsRepository = {
  getBlogById: async (
    id: string
  ): Promise<HydratedDocument<TBlogRepViewModel> | null> => {
    if (!ObjectId.isValid(id)) return null;
    const blog: HydratedDocument<TBlogRepViewModel> | null =
      await BlogModelClass.findById(new ObjectId(id));

    return blog;
  },

  saveBlog: async (
    blog: HydratedDocument<TBlogRepViewModel>
  ): Promise<void> => {
    await blog.save();
  },

  deleteBlogById: async (
    blog: HydratedDocument<TBlogRepViewModel>
  ): Promise<void> => {
    await blog.deleteOne();
  },
};

export default blogsRepository;
