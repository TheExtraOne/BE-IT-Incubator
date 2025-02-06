import { Response } from "express";
import LikesService from "../../likes/app/likes-service";
import TPathParamsPostModel from "../../posts/types/PathParamsPostModel";
import CommentsService from "../app/comments-service";
import CommentsQueryRepository from "../infrastructure/comments-query-repository";
import TCommentsLikeInputModel from "../types/CommentLikeInputModel";
import TCommentServiceViewModel from "../types/CommentServiceViewModel";
import TPathParamsCommentsModel from "../types/PathParamsCommentModel";
import TPostCommentControllerInputModel from "../types/PostCommentControllerInputModel";
import TCommentControllerViewModel from "../types/PostCommentControllerViewModel";
import TQueryCommentsModel from "../types/QueryCommentsModel";
import { inject, injectable } from "inversify";
import {
  RESULT_STATUS,
  HTTP_STATUS,
  SORT_DIRECTION,
  LIKE_TYPE,
} from "../../../common/settings";
import {
  TRequestWithParamsAndBody,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
  TRequestWithParams,
  Result,
} from "../../../common/types/types";

// TODO: add dto
@injectable()
class CommentsController {
  constructor(
    @inject("CommentsQueryRepository")
    private commentsQueryRepository: CommentsQueryRepository,
    @inject("CommentsService")
    private commentsService: CommentsService,
    @inject("LikesService")
    private likesService: LikesService
  ) {}

  async createCommentForPostById(
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ): Promise<void> {
    const result: Result<string | null> =
      await this.commentsService.createComment({
        content: req.body.content,
        userId: req.userId!,
        postId: req.params.id,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const commentId = result.data!;
    const createdComment: TCommentControllerViewModel | null =
      await this.commentsQueryRepository.getCommentById(commentId);

    res.status(HTTP_STATUS.CREATED_201).json(createdComment);
  }

  async getAllCommentsForPostId(
    req: TRequestWithQueryAndParams<TQueryCommentsModel, TPathParamsPostModel>,
    res: Response
  ): Promise<void> {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    const comments: TResponseWithPagination<
      TCommentControllerViewModel[] | []
    > = await this.commentsQueryRepository.getAllCommentsForPostId({
      pageNumber: +pageNumber,
      pageSize: +pageSize,
      sortBy,
      sortDirection,
      postId: req.params.id,
    });

    const userId: string | null = req.userId;

    // Enrich comments with like status
    const enrichedComments =
      await this.likesService.enrichCommentsWithLikeStatus(comments, userId);
    res.status(HTTP_STATUS.OK_200).json(enrichedComments);
  }

  async getCommentById(
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ): Promise<void> {
    const userId: string | null = req.userId;
    const commentId = req.params.id;

    const comment: TCommentControllerViewModel | null =
      await this.commentsQueryRepository.getCommentById(commentId);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    // Enrich comment with like status
    const enrichedComment: TCommentControllerViewModel =
      await this.likesService.enrichCommentWithLikeStatus(comment, userId);
    res.status(HTTP_STATUS.OK_200).json(enrichedComment);
  }

  async changeLikeStatus(
    req: TRequestWithParamsAndBody<
      TPathParamsCommentsModel,
      TCommentsLikeInputModel
    >,
    res: Response
  ): Promise<void> {
    // Validation if user authorized and if the inputModel has incorrect values happens in the middleware
    // Check if comment exists
    const commentId = req.params.id;
    const comment: TCommentControllerViewModel | null =
      await this.commentsQueryRepository.getCommentById(commentId);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Check and extract userId in the middlewares
    const userId = req.userId!;
    const likeStatus = req.body.likeStatus;
    await this.likesService.changeLikeStatus({
      userId,
      parentId: commentId,
      likeStatus,
      likeType: LIKE_TYPE.COMMENT,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async updateComment(
    req: TRequestWithParamsAndBody<
      TPathParamsCommentsModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ): Promise<void> {
    // Check that comment exists
    const comment: TCommentServiceViewModel | null =
      await this.commentsQueryRepository.getCommentById(req.params.id);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Check that user can modify comment
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    this.commentsService.updateCommentById({
      id: req.params.id,
      content: req.body.content,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async deleteComment(
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ): Promise<void> {
    // Check that comment exists
    const comment: TCommentServiceViewModel | null =
      await this.commentsQueryRepository.getCommentById(req.params.id);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    // Check that user can delete the comment
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    this.commentsService.deleteCommentById(req.params.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}

export default CommentsController;
