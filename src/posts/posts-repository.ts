import { ObjectId } from "mongodb";
import PostRepViewModel from "./models/PostRepViewModel";
import { PostModelDb } from "../db/db";
import { HydratedDocument } from "mongoose";

class PostsRepository {
  async savePost(post: HydratedDocument<PostRepViewModel>): Promise<void> {
    await post.save();
  }

  async getPostById(
    id: string
  ): Promise<HydratedDocument<PostRepViewModel> | null> {
    if (!ObjectId.isValid(id)) return null;

    const post: HydratedDocument<PostRepViewModel> | null =
      await PostModelDb.findById(new ObjectId(id));

    return post;
  }

  async deletePostById(
    post: HydratedDocument<PostRepViewModel>
  ): Promise<void> {
    await post.deleteOne();
  }
}

export default PostsRepository;
