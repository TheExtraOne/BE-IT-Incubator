import { Response } from "express";
import { SORT_DIRECTION, HTTP_STATUS, RESULT_STATUS } from "../common/settings";
import {
  Result,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../common/types/types";
import TPostCommentControllerInputModel from "./models/PostCommentControllerInputModel";
import TPathParamsPostModel from "../posts/models/PathParamsPostModel";
import TCommentControllerViewModel from "./models/PostCommentControllerViewModel";
import commentsService from "./comments-service";
import TQueryCommentsModel from "./models/QueryCommentsModel";
import commentsQueryRepository from "./comments-query-repository";
import TPathParamsCommentsModel from "./models/PathParamsCommentModel";
import TCommentServiceViewModel from "./models/CommentServiceViewModel";

const commentsController = {
  createCommentForPostById: async (
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ) => {
    const result: Result<TCommentServiceViewModel | null> =
      await commentsService.createComment({
        content: req.body.content,
        userId: req.userId!,
        postId: req.params.id,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    res.status(HTTP_STATUS.CREATED_201).json(result.data);
  },

  getAllCommentsForPostId: async (
    req: TRequestWithQueryAndParams<TQueryCommentsModel, TPathParamsPostModel>,
    res: Response
  ) => {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    // We are reaching out to commentsQueryRepository directly because of CQRS
    const comments: TResponseWithPagination<
      TCommentControllerViewModel[] | []
    > = await commentsQueryRepository.getAllCommentsForPostId({
      pageNumber: +pageNumber,
      pageSize: +pageSize,
      sortBy,
      sortDirection,
      postId: req.params.id,
    });
    res.status(HTTP_STATUS.OK_200).json(comments);
  },

  getCommentById: async (
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ) => {
    // We are reaching out to postsQueryRepository directly because of CQRS
    const comment: TCommentServiceViewModel | null =
      await commentsQueryRepository.getCommentById(req.params.id);

    comment
      ? res.status(HTTP_STATUS.OK_200).json(comment)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  },

  updateComment: async (
    req: TRequestWithParamsAndBody<
      TPathParamsCommentsModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ) => {
    // Check that comment exists
    const comment: TCommentServiceViewModel | null =
      await commentsQueryRepository.getCommentById(req.params.id);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Check that user can modify comment
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    commentsService.updateCommentById({
      id: req.params.id,
      content: req.body.content,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  deleteComment: async (
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ) => {
    // Check that comment exists
    const comment: TCommentServiceViewModel | null =
      await commentsQueryRepository.getCommentById(req.params.id);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    // Check that userId is the same in the comment's author
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    commentsService.deleteCommentById(req.params.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },
};

export default commentsController;
