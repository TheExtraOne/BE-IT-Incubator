import { ObjectId } from "mongodb";
import { LIKE_STATUS, LIKE_TYPE, RESULT_STATUS } from "../common/settings";
import LikesRepViewModel from "./models/LikeRepViewModel";
import LikesRepository from "./likes-repository";
import { LikeModelDb } from "../db/db";
import { Result } from "../common/types/types";
import { HydratedDocument } from "mongoose";
import CommentsService from "../comments/comments-service";

class LikesService {
  constructor(
    protected likesRepository: LikesRepository,
    protected commentService: CommentsService
  ) {}
  async createLike({
    userId,
    commentId,
    likeStatus,
    likeType,
  }: {
    userId: string;
    commentId: string;
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
      commentId,
      new Date(),
      likeType
    );
    const likeEntity = new LikeModelDb(newLike);
    await this.likesRepository.saveLike(likeEntity);

    // Update total amount of likes/dislikes in comments bd
    await this.commentService.updateLikesAmountById({
      id: commentId,
      deltaLikesCount: likeStatus === LIKE_STATUS.LIKE ? 1 : 0,
      deltaDislikesCount: likeStatus === LIKE_STATUS.DISLIKE ? 1 : 0,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async updateLike({
    likeStatus,
    like,
    commentId,
  }: {
    likeStatus: LIKE_STATUS;
    like: HydratedDocument<LikesRepViewModel>;
    commentId: string;
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
        commentId,
        previousLikeStatus: currentLikeStatus,
      });
    }

    like.status = likeStatus;
    await this.likesRepository.saveLike(like);
    // Update total amount of likes/dislikes in comments bd
    await this.commentService.updateLikesAmountById({
      id: commentId,
      deltaLikesCount: currentLikeStatus === LIKE_STATUS.LIKE ? -1 : 1,
      deltaDislikesCount: currentLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 1,
    });

    return result;
  }

  async deleteLike({
    like,
    commentId,
    previousLikeStatus,
  }: {
    like: HydratedDocument<LikesRepViewModel>;
    commentId: string;
    previousLikeStatus: LIKE_STATUS;
  }): Promise<Result> {
    await this.likesRepository.deleteLike(like);
    // Update total amount of likes/dislikes in comments bd
    await this.commentService.updateLikesAmountById({
      id: commentId,
      deltaLikesCount: previousLikeStatus === LIKE_STATUS.LIKE ? -1 : 0,
      deltaDislikesCount: previousLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 0,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async getLikeByUserAndCommentId(
    userId: string,
    commentId: string
  ): Promise<HydratedDocument<LikesRepViewModel> | null> {
    return await this.likesRepository.getLikeByUserAndCommentId(
      userId,
      commentId
    );
  }

  async changeLikeStatus({
    userId,
    commentId,
    likeStatus,
    likeType,
  }: {
    userId: string;
    commentId: string;
    likeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    // Check if user already liked/disliked the comment
    const like: HydratedDocument<LikesRepViewModel> | null =
      await this.getLikeByUserAndCommentId(userId, commentId);

    if (like) {
      // If user has already liked/disliked the comment, update the like status
      return await this.updateLike({
        likeStatus,
        like,
        commentId,
      });
    }
    // If user has not liked/disliked the comment before, create a new like
    return await this.createLike({
      userId,
      commentId,
      likeStatus,
      likeType,
    });
  }
}

export default LikesService;
