import { ObjectId } from "mongodb";
import TCommentsServiceInputModel from "./models/CommentServiceInputModel";
import usersQueryRepository from "../users/users-query-repository";
import commentsRepository from "./comments-repository";
import commentsQueryRepository from "./comments-query-repository";
import TCommentServiceViewModel from "./models/CommentServiceViewModel";
import TCommentRepViewModel from "./models/CommentRepViewModel";
import TUserControllerViewModel from "../users/models/UserControllerViewModel";

const commentsService = {
  createComment: async ({
    content,
    userId,
    postId,
  }: TCommentsServiceInputModel): Promise<TCommentServiceViewModel | null> => {
    const user: TUserControllerViewModel | null =
      await usersQueryRepository.getUserById(userId!);
    if (!user) return null;

    const commentatorInfo = {
      userId: userId,
      userLogin: user.login,
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

    const createdComment: TCommentServiceViewModel | null =
      await commentsQueryRepository.getCommentById(commentId);

    return createdComment;
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
