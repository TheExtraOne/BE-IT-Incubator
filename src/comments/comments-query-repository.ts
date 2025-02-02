import { ObjectId } from "mongodb";
import { CommentModelDb } from "../db/db";
import { SORT_DIRECTION } from "../common/settings";
import CommentRepViewModel from "./models/CommentRepViewModel";
import TCommentControllerViewModel from "./models/CommentServiceViewModel";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";

class CommentsQueryRepository {
  private mapComment(
    comment: CommentRepViewModel
  ): TCommentControllerViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
    };
  }

  private mapComments(
    comments: CommentRepViewModel[] | []
  ): TCommentControllerViewModel[] {
    return comments.map(this.mapComment);
  }

  private async getCommentsCount({
    postId,
  }: {
    postId?: string;
  }): Promise<number> {
    const query = CommentModelDb.countDocuments();
    if (postId) query.where("postId", postId);

    return await query;
  }

  async getCommentById(
    id: string
  ): Promise<TCommentControllerViewModel | null> {
    if (!ObjectId.isValid(id)) return null;

    const comment: CommentRepViewModel | null = await CommentModelDb.findById(
      new ObjectId(id)
    ).lean();

    return comment ? this.mapComment(comment) : null;
  }

  async getAllCommentsForPostId({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    postId,
  }: {
    sortBy: string;
    sortDirection: TSortDirection;
    pageNumber: number;
    pageSize: number;
    postId: string;
  }): Promise<TResponseWithPagination<TCommentControllerViewModel[] | []>> {
    // Pagination
    const commentsCount: number = await this.getCommentsCount({ postId });
    const pagesCount: number =
      commentsCount && pageSize ? Math.ceil(commentsCount / pageSize) : 0;
    const commentsToSkip = (pageNumber - 1) * pageSize;

    const comments: CommentRepViewModel[] | [] = await CommentModelDb.find()
      .where("postId", postId)
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(commentsToSkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: this.mapComments(comments),
    };
  }
}

export default CommentsQueryRepository;
