import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import CommentsRepository from "../infrastructure/comments-repository";
import { RESULT_STATUS } from "../../common/settings";
import UserAccountRepViewModel from "../../users/types/UserAccountRepViewModel";
import UsersRepository from "../../users/infrastructure/users-repository";
import { Result, TLikesInfo } from "../../common/types/types";
import { CommentModelDb } from "../domain/comment-model";
import CommentRepViewModel, {
  TCommentatorInfo,
} from "../types/CommentRepViewModel";
import TCommentsServiceInputModel from "../types/CommentServiceInputModel";
import { inject, injectable } from "inversify";

@injectable()
class CommentsService {
  constructor(
    @inject("CommentsRepository") private commentRepository: CommentsRepository,
    @inject("UsersRepository") private usersRepository: UsersRepository
  ) {}

  async createComment({
    content,
    userId,
    postId,
  }: TCommentsServiceInputModel): Promise<Result<string | null>> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getUserById(userId!);

    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "userId", message: "Not Found" }],
      };
    }

    const commentatorInfo: TCommentatorInfo = {
      userId: userId,
      userLogin: user.accountData.userName,
    };
    const likesInfo: TLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };

    const newComment: CommentRepViewModel = new CommentRepViewModel(
      new ObjectId(),
      content,
      commentatorInfo,
      new Date().toISOString(),
      postId,
      likesInfo
    );

    const commentInstance: HydratedDocument<CommentRepViewModel> =
      new CommentModelDb(newComment);

    await this.commentRepository.saveComment(commentInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: commentInstance._id.toString(),
      extensions: [],
    };
  }

  async updateCommentById({
    id,
    content,
  }: {
    id: string;
    content: string;
  }): Promise<Result> {
    const commentInstance: HydratedDocument<CommentRepViewModel> | null =
      await this.commentRepository.getCommentById(id);
    if (!commentInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }
    commentInstance.content = content;
    await this.commentRepository.saveComment(commentInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async updateLikesAmountById({
    id,
    deltaLikesCount = 0,
    deltaDislikesCount = 0,
  }: {
    id: string;
    deltaLikesCount?: number;
    deltaDislikesCount?: number;
  }): Promise<Result> {
    // Update total amount of likes/dislikes in comments bd
    const comment = await this.commentRepository.getCommentById(id);
    if (!comment) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        extensions: [{ field: "commentId", message: "Not Found" }],
      };
    }
    comment.likesInfo.likesCount += deltaLikesCount;
    comment.likesInfo.dislikesCount += deltaDislikesCount;

    await this.commentRepository.saveComment(comment);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async deleteCommentById(id: string): Promise<Result> {
    const commentInstance: HydratedDocument<CommentRepViewModel> | null =
      await this.commentRepository.getCommentById(id);
    if (!commentInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await this.commentRepository.deleteComment(commentInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }
}

export default CommentsService;
