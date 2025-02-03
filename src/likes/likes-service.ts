import { ObjectId } from "mongodb";
import { LIKE_STATUS, LIKE_TYPE, RESULT_STATUS } from "../common/settings";
import LikesRepViewModel from "./models/LikeRepViewModel";
import LikesRepository from "./likes-repository";
import { LikeModelDb } from "../db/db";
import { Result } from "../common/types/types";
import CommentsRepository from "../comments/comments-repository";

class LikesService {
  constructor(
    protected likesRepository: LikesRepository,
    protected commentsRepository: CommentsRepository
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
    const comment = await this.commentsRepository.getCommentById(commentId);
    if (!comment) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        extensions: [{ field: "commentId", message: "Not Found" }],
      };
    }
    comment.likesInfo.likesCount += likeStatus === LIKE_STATUS.LIKE ? 1 : 0;
    comment.likesInfo.dislikesCount +=
      likeStatus === LIKE_STATUS.DISLIKE ? 1 : 0;

    await this.commentsRepository.saveComment(comment);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
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
    //...
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
