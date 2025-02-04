import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import { BlogModelDb } from "../../db/db";
import BlogRepViewModel from "../domain/BlogRepViewModel";

class BlogsRepository {
  async getBlogById(
    id: string
  ): Promise<HydratedDocument<BlogRepViewModel> | null> {
    if (!ObjectId.isValid(id)) return null;
    const blog: HydratedDocument<BlogRepViewModel> | null =
      await BlogModelDb.findById(new ObjectId(id));

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

export default BlogsRepository;
