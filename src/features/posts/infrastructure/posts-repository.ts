import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import PostRepViewModel from "../types/PostRepViewModel";
import { PostModelDb } from "../domain/post-model";
import { injectable } from "inversify";

@injectable()
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
