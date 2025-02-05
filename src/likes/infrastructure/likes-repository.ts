import { HydratedDocument } from "mongoose";
import LikesRepViewModel from "../types/LikeRepViewModel";
import { LikeModelDb } from "../domain/like-model";

class LikesRepository {
  async saveLike(like: HydratedDocument<LikesRepViewModel>): Promise<void> {
    await like.save();
  }

  async getLikeByUserAndCommentId(
    userId: string,
    commentId: string
  ): Promise<HydratedDocument<LikesRepViewModel> | null> {
    const like: HydratedDocument<LikesRepViewModel> | null =
      await LikeModelDb.findOne({ authorId: userId, parentId: commentId });

    return like;
  }

  async getLikesByUserId(userId: string): Promise<LikesRepViewModel[] | null> {
    const likes: LikesRepViewModel[] | null = await LikeModelDb.find({
      authorId: userId,
    }).lean();

    return likes;
  }

  async deleteLike(like: HydratedDocument<LikesRepViewModel>): Promise<void> {
    await like.deleteOne();
  }
}

export default LikesRepository;
