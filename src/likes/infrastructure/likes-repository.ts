import { HydratedDocument } from "mongoose";
import LikesRepViewModel from "../types/LikeRepViewModel";
import { LikeModelDb } from "../domain/like-model";
import { SORT_DIRECTION } from "../../common/settings";

class LikesRepository {
  async saveLike(like: HydratedDocument<LikesRepViewModel>): Promise<void> {
    await like.save();
  }

  async getLikeByUserAndParentId(
    userId: string,
    parentId: string
  ): Promise<HydratedDocument<LikesRepViewModel> | null> {
    const like: HydratedDocument<LikesRepViewModel> | null =
      await LikeModelDb.findOne({ authorId: userId, parentId: parentId });

    return like;
  }

  async getLikesByUserId(userId: string): Promise<LikesRepViewModel[] | null> {
    const likes: LikesRepViewModel[] | null = await LikeModelDb.find({
      authorId: userId,
    }).lean();

    return likes;
  }

  async getLikesByParentIdWithDateSort({
    parentId,
    sortDirection,
  }: {
    parentId: string;
    sortDirection: SORT_DIRECTION;
  }): Promise<LikesRepViewModel[] | null> {
    const likes: LikesRepViewModel[] | null = await LikeModelDb.find({
      parentId: parentId,
    })
      .sort({ createdAt: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .lean();

    return likes;
  }

  async deleteLike(like: HydratedDocument<LikesRepViewModel>): Promise<void> {
    await like.deleteOne();
  }
}

export default LikesRepository;
