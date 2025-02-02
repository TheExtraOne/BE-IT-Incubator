import { ObjectId } from "mongodb";
import TCommentsServiceInputModel from "./models/CommentServiceInputModel";
import commentsRepository from "./comments-repository";
import CommentRepViewModel, {
  TCommentatorInfo,
} from "./models/CommentRepViewModel";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import usersRepository from "../users/users-repository";
import UserAccountRepViewModel from "../users/models/UserAccountRepViewModel";
import { HydratedDocument } from "mongoose";
import { CommentModelDb } from "../db/db";

class CommentsService {
  async createComment({
    content,
    userId,
    postId,
  }: TCommentsServiceInputModel): Promise<Result<string | null>> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await usersRepository.getUserById(userId!);

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

    const newComment: CommentRepViewModel = new CommentRepViewModel(
      new ObjectId(),
      content,
      commentatorInfo,
      new Date().toISOString(),
      postId
    );

    const commentInstance: HydratedDocument<CommentRepViewModel> =
      new CommentModelDb(newComment);

    await commentsRepository.saveComment(commentInstance);

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
      await commentsRepository.getCommentById(id);
    if (!commentInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }
    commentInstance.content = content;
    await commentsRepository.saveComment(commentInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async deleteCommentById(id: string): Promise<Result> {
    const commentInstance: HydratedDocument<CommentRepViewModel> | null =
      await commentsRepository.getCommentById(id);
    if (!commentInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await commentsRepository.deleteCommentById(commentInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }
}

export default new CommentsService();
