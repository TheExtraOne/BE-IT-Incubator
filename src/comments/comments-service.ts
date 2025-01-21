import { ObjectId } from "mongodb";
import TCommentsServiceInputModel from "./models/CommentServiceInputModel";
import commentsRepository from "./comments-repository";
import TCommentServiceViewModel from "./models/CommentServiceViewModel";
import TCommentRepViewModel from "./models/CommentRepViewModel";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import usersRepository from "../users/users-repository";
import TCommentControllerViewModel from "./models/PostCommentControllerViewModel";
import TUserAccountRepViewModel from "../users/models/UserAccountRepViewModel";

const mapComment = (
  comment: TCommentRepViewModel
): TCommentControllerViewModel => ({
  id: comment._id.toString(),
  content: comment.content,
  commentatorInfo: comment.commentatorInfo,
  createdAt: comment.createdAt,
});

const commentsService = {
  createComment: async ({
    content,
    userId,
    postId,
  }: TCommentsServiceInputModel): Promise<
    Result<TCommentServiceViewModel | null>
  > => {
    const user: TUserAccountRepViewModel | null =
      await usersRepository.getUserById(userId!);

    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "userId", message: "Not Found" }],
      };
    }

    const commentatorInfo = {
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

    const commentId: string = await commentsRepository.createComment(
      newComment
    );

    const createdComment: TCommentRepViewModel | null =
      await commentsRepository.getCommentById(commentId);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: mapComment(createdComment!),
      extensions: [],
    };
  },

  updateCommentById: async ({
    id,
    content,
  }: {
    id: string;
    content: string;
  }): Promise<boolean> =>
    await commentsRepository.updateCommentById({ id, content }),

  deleteCommentById: async (id: string): Promise<boolean> =>
    await commentsRepository.deleteCommentById(id),
};

export default commentsService;
