import { ObjectId } from "mongodb";
import { LIKE_STATUS, LIKE_TYPE, RESULT_STATUS } from "../../common/settings";
import LikesRepViewModel from "../types/LikeRepViewModel";
import { Result } from "../../common/types/types";
import { HydratedDocument } from "mongoose";
import CommentsService from "../../comments/app/comments-service";
import LikesRepository from "../infrastructure/likes-repository";
import { LikeModelDb } from "../domain/like-model";
import PostsService from "../../posts/app/posts-service";

class LikesService {
  constructor(
    protected likesRepository: LikesRepository,
    protected commentService: CommentsService,
    protected postsService: PostsService
  ) {}
  async createLike({
    userId,
    parentId,
    likeStatus,
    likeType,
  }: {
    userId: string;
    parentId: string;
    likeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    if (likeStatus === LIKE_STATUS.NONE) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        extensions: [{ field: "likeStatus", message: "Incorrect status" }],
      };
    }
    const newLike = new LikesRepViewModel(
      new ObjectId(),
      likeStatus,
      userId,
      parentId,
      new Date(),
      likeType
    );
    const likeEntity = new LikeModelDb(newLike);
    await this.likesRepository.saveLike(likeEntity);

    if (likeType === LIKE_TYPE.COMMENT) {
      // Update total amount of likes/dislikes for comments
      await this.commentService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: likeStatus === LIKE_STATUS.LIKE ? 1 : 0,
        deltaDislikesCount: likeStatus === LIKE_STATUS.DISLIKE ? 1 : 0,
      });
    }
    if (likeType === LIKE_TYPE.POST) {
      // Update total amount of likes/dislikes for posts
      await this.postsService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: likeStatus === LIKE_STATUS.LIKE ? 1 : 0,
        deltaDislikesCount: likeStatus === LIKE_STATUS.DISLIKE ? 1 : 0,
      });
    }

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async updateLike({
    likeStatus,
    like,
    parentId,
    likeType,
  }: {
    likeStatus: LIKE_STATUS;
    like: HydratedDocument<LikesRepViewModel>;
    parentId: string;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    const currentLikeStatus = like.status;
    const result: Result = {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
    // If the status is the same
    if (likeStatus === currentLikeStatus) {
      return result;
    }
    // If status is none and current status is like or dislike - we delete the like
    if (likeStatus === LIKE_STATUS.NONE) {
      return await this.deleteLike({
        like,
        parentId,
        previousLikeStatus: currentLikeStatus,
        likeType,
      });
    }

    like.status = likeStatus;
    await this.likesRepository.saveLike(like);

    if (likeType === LIKE_TYPE.COMMENT) {
      // Update total amount of likes/dislikes in comments bd
      await this.commentService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: currentLikeStatus === LIKE_STATUS.LIKE ? -1 : 1,
        deltaDislikesCount: currentLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 1,
      });
    }

    if (likeType === LIKE_TYPE.POST) {
      // Update total amount of likes/dislikes for posts
      await this.postsService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: currentLikeStatus === LIKE_STATUS.LIKE ? -1 : 1,
        deltaDislikesCount: currentLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 1,
      });
    }
    return result;
  }

  async deleteLike({
    like,
    parentId,
    previousLikeStatus,
    likeType,
  }: {
    like: HydratedDocument<LikesRepViewModel>;
    parentId: string;
    previousLikeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    await this.likesRepository.deleteLike(like);

    if (likeType === LIKE_TYPE.COMMENT) {
      // Update total amount of likes/dislikes in comments bd
      await this.commentService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: previousLikeStatus === LIKE_STATUS.LIKE ? -1 : 0,
        deltaDislikesCount: previousLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 0,
      });
    }

    if (likeType === LIKE_TYPE.POST) {
      // Update total amount of likes/dislikes for posts
      await this.postsService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: previousLikeStatus === LIKE_STATUS.LIKE ? -1 : 0,
        deltaDislikesCount: previousLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 0,
      });
    }

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async getLikeByUserAndCommentId(
    userId: string,
    parentId: string
  ): Promise<HydratedDocument<LikesRepViewModel> | null> {
    return await this.likesRepository.getLikeByUserAndCommentId(
      userId,
      parentId
    );
  }

  async getLikesByUserId(userId: string): Promise<LikesRepViewModel[] | null> {
    return await this.likesRepository.getLikesByUserId(userId);
  }

  async changeLikeStatus({
    userId,
    parentId,
    likeStatus,
    likeType,
  }: {
    userId: string;
    parentId: string;
    likeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    // Check if user already liked/disliked the comment or the post
    const like: HydratedDocument<LikesRepViewModel> | null =
      await this.getLikeByUserAndCommentId(userId, parentId);

    if (like) {
      // If user has already liked/disliked the comment or the post, update the like status
      return await this.updateLike({
        likeStatus,
        like,
        parentId,
        likeType,
      });
    }
    // If user has not liked/disliked the comment or the post before, create a new like
    return await this.createLike({
      userId,
      parentId,
      likeStatus,
      likeType,
    });
  }
}

export default LikesService;
