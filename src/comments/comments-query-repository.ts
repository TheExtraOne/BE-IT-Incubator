import { ObjectId } from "mongodb";
import { commentCollection } from "../db/db";
import { SORT_DIRECTION } from "../settings";
import TCommentRepViewModel from "./models/CommentRepViewModel";
import TCommentControllerViewModel from "./models/CommentServiceViewModel";
import { TResponseWithPagination, TSortDirection } from "../types/types";

const mapComment = (
  comment: TCommentRepViewModel
): TCommentControllerViewModel => ({
  id: comment._id.toString(),
  content: comment.content,
  commentatorInfo: comment.commentatorInfo,
  createdAt: comment.createdAt,
});

const mapComments = (
  comments: TCommentRepViewModel[] | []
): TCommentControllerViewModel[] => comments.map(mapComment);

const commentsQueryRepository = {
  getCommentsCount: async ({
    postId,
  }: {
    postId?: string;
  }): Promise<number> => {
    const filters: Record<string, string> | Record<string, never> = {};
    if (postId) filters.postId = postId;

    return await commentCollection.countDocuments(filters);
  },

  getCommentById: async (
    id: string
  ): Promise<TCommentControllerViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;

    const comment: TCommentRepViewModel | null =
      await commentCollection.findOne({
        _id: new ObjectId(id),
      });

    return comment ? mapComment(comment) : null;
  },

  getAllCommentsForPostId: async ({
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
  }): Promise<TResponseWithPagination<TCommentControllerViewModel[] | []>> => {
    // Pagination
    const commentsCount: number =
      await commentsQueryRepository.getCommentsCount({ postId });
    const pagesCount =
      commentsCount && pageSize ? Math.ceil(commentsCount / pageSize) : 0;
    const commentsToSkip = (pageNumber - 1) * pageSize;

    const comments: TCommentRepViewModel[] | [] = await commentCollection
      .find({ postId })
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(commentsToSkip)
      .limit(pageSize)
      .toArray();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: commentsCount,
      items: mapComments(comments),
    };
  },
};

export default commentsQueryRepository;
