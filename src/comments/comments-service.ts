import { ObjectId } from "mongodb";
import TCommentsServiceInputModel from "./models/CommentServiceInputModel";
import commentsRepository from "./comments-repository";
import TCommentRepViewModel, {
  TCommentatorInfo,
} from "./models/CommentRepViewModel";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import usersRepository from "../users/users-repository";
import TUserAccountRepViewModel from "../users/models/UserAccountRepViewModel";
import { HydratedDocument } from "mongoose";
import { CommentModelClass } from "../db/db";

const commentsService = {
  createComment: async ({
    content,
    userId,
    postId,
  }: TCommentsServiceInputModel): Promise<Result<string | null>> => {
    const user: HydratedDocument<TUserAccountRepViewModel> | null =
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

    const newComment: TCommentRepViewModel = {
      _id: new ObjectId(),
      content,
      commentatorInfo,
      createdAt: new Date().toISOString(),
      postId,
    };

    const commentInstance: HydratedDocument<TCommentRepViewModel> =
      new CommentModelClass(newComment);

    await commentsRepository.saveComment(commentInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: commentInstance._id.toString(),
      extensions: [],
    };
  },

  updateCommentById: async ({
    id,
    content,
  }: {
    id: string;
    content: string;
  }): Promise<Result> => {
    const commentInstance: HydratedDocument<TCommentRepViewModel> | null =
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
  },

  deleteCommentById: async (id: string): Promise<Result> => {
    const commentInstance: HydratedDocument<TCommentRepViewModel> | null =
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
  },
};

export default commentsService;
