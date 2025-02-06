import { HydratedDocument } from "mongoose";
import LikesRepViewModel from "../types/LikeRepViewModel";
import { LikeModelDb } from "../domain/like-model";
import { injectable } from "inversify";
import { SORT_DIRECTION, LIKE_STATUS } from "../../../common/settings";

@injectable()
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
    status,
  }: {
    parentId: string;
    sortDirection: SORT_DIRECTION;
    status: LIKE_STATUS;
  }): Promise<LikesRepViewModel[] | null> {
    const likes: LikesRepViewModel[] | null = await LikeModelDb.find({
      parentId: parentId,
      status: status,
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
