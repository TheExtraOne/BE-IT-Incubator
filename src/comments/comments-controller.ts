import { Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import {
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../types/types";
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
    const newComment: TCommentControllerViewModel | null =
      await commentsService.createComment({
        content: req.body.content,
        userId: req.userId!,
        postId: req.params.id,
      });
    res.status(STATUS.CREATED_201).json(newComment);
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
    res.status(STATUS.OK_200).json(comments);
  },

  getCommentById: async (
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ) => {
    // We are reaching out to postsQueryRepository directly because of CQRS
    const comment: TCommentServiceViewModel | null =
      await commentsQueryRepository.getCommentById(req.params.id);

    comment
      ? res.status(STATUS.OK_200).json(comment)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  // updateComment: async (
  //   req: TRequestWithParamsAndBody<
  //     TPathParamsPostModel,
  //     TPostControllerInputModel
  //   >,
  //   res: Response
  // ) => {
  //   const { title, shortDescription, content, blogId } = req.body;
  //   const success = await postsService.updatePostById({
  //     id: req.params.id,
  //     title,
  //     shortDescription,
  //     content,
  //     blogId,
  //   });
  //   success
  //     ? res.sendStatus(STATUS.NO_CONTENT_204)
  //     : res.sendStatus(STATUS.NOT_FOUND_404);
  // },
  //   deleteComment: async (
  //     req: TRequestWithParams<TPathParamsPostModel>,
  //     res: Response
  //   ) => {
  //     const success = await postsService.deletePostById(req.params.id);
  //     res.sendStatus(success ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404);
  //   },
};

export default commentsController;
