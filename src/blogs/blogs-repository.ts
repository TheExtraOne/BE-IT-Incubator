import { ObjectId } from "mongodb";
import BlogRepViewModel from "./models/BlogRepViewModel";
import { BlogModelMongoose } from "../db/db";
import { HydratedDocument } from "mongoose";

class BlogsRepository {
  async getBlogById(
    id: string
  ): Promise<HydratedDocument<BlogRepViewModel> | null> {
    if (!ObjectId.isValid(id)) return null;
    const blog: HydratedDocument<BlogRepViewModel> | null =
      await BlogModelMongoose.findById(new ObjectId(id));

    return blog;
  }

  async saveBlog(blog: HydratedDocument<BlogRepViewModel>): Promise<void> {
    await blog.save();
  }

  async deleteBlogById(
    blog: HydratedDocument<BlogRepViewModel>
  ): Promise<void> {
    await blog.deleteOne();
  }
}

export default new BlogsRepository();
