import { HydratedDocument } from "mongoose";
import LikesRepViewModel from "./models/LikeRepViewModel";
import { LikeModelDb } from "../db/db";

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

  async deleteLike(like: HydratedDocument<LikesRepViewModel>): Promise<void> {
    await like.deleteOne();
  }
}

export default LikesRepository;
