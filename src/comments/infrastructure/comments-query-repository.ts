import { ObjectId } from "mongodb";
import { LIKE_STATUS, SORT_DIRECTION } from "../../common/settings";
import { TResponseWithPagination } from "../../common/types/types";
import { CommentModelDb } from "../../db/db";
import CommentRepViewModel from "../domain/CommentRepViewModel";
import TCommentControllerViewModel from "../domain/PostCommentControllerViewModel";

class CommentsQueryRepository {
  private mapComment(
    comment: CommentRepViewModel
  ): TCommentControllerViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        myStatus: LIKE_STATUS.NONE,
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
      },
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
    sortDirection: SORT_DIRECTION;
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
