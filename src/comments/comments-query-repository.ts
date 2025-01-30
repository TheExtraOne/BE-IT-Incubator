import { ObjectId } from "mongodb";
import { CommentModelClass } from "../db/db";
import { SORT_DIRECTION } from "../common/settings";
import TCommentRepViewModel from "./models/CommentRepViewModel";
import TCommentControllerViewModel from "./models/CommentServiceViewModel";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";

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
  _getCommentsCount: async ({
    postId,
  }: {
    postId?: string;
  }): Promise<number> => {
    const query = CommentModelClass.countDocuments();
    if (postId) query.where("postId", postId);

    return await query;
  },

  getCommentById: async (
    id: string
  ): Promise<TCommentControllerViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;

    const comment: TCommentRepViewModel | null =
      await CommentModelClass.findById(new ObjectId(id)).lean();

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
      await commentsQueryRepository._getCommentsCount({ postId });
    const pagesCount: number =
      commentsCount && pageSize ? Math.ceil(commentsCount / pageSize) : 0;
    const commentsToSkip = (pageNumber - 1) * pageSize;

    const comments: TCommentRepViewModel[] | [] = await CommentModelClass.find()
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
      items: mapComments(comments),
    };
  },
};

export default commentsQueryRepository;
