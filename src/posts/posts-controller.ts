import { Response } from "express";
import { SORT_DIRECTION, HTTP_STATUS, RESULT_STATUS } from "../common/settings";
import postsService from "./posts-service";
import {
  Result,
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../common/types/types";
import TQueryPostModel from "./models/QueryPostModel";
import TPostControllerViewModel from "./models/PostControllerViewModel";
import postsQueryRepository from "./posts-query-repository";
import TPathParamsPostModel from "./models/PathParamsPostModel";
import TPostControllerInputModel from "./models/PostControllerInputModel";
import TPostCommentControllerInputModel from "../comments/models/PostCommentControllerInputModel";
import commentsController from "../comments/comments-controller";
import TQueryCommentsModel from "../comments/models/QueryCommentsModel";

const postsController = {
  getPosts: async (req: TRequestWithQuery<TQueryPostModel>, res: Response) => {
    // Validating in the middleware
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    // We are reaching out to postsQueryRepository directly because of CQRS
    const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
      await postsQueryRepository.getAllPosts({
        blogId: null,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(HTTP_STATUS.OK_200).json(posts);
  },

  getPost: async (
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) => {
    // We are reaching out to postsQueryRepository directly because of CQRS
    const post: TPostControllerViewModel | null =
      await postsQueryRepository.getPostById(req.params.id);

    post
      ? res.status(HTTP_STATUS.OK_200).json(post)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  },

  getAllCommentsForPostById: async (
    req: TRequestWithQueryAndParams<TQueryCommentsModel, TPathParamsPostModel>,
    res: Response
  ) => {
    // userId is checked in the middlewares
    const post: TPostControllerViewModel | null =
      await postsQueryRepository.getPostById(req.params.id);
    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    commentsController.getAllCommentsForPostId(req, res);
  },

  createPost: async (
    req: TRequestWithBody<TPostControllerInputModel>,
    res: Response
  ) => {
    const { title, shortDescription, content, blogId } = req.body;
    // Validating blogID in the middlewares
    const result: Result<string | null> = await postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const newPost: TPostControllerViewModel | null =
      await postsQueryRepository.getPostById(result.data!);

    res.status(HTTP_STATUS.CREATED_201).json(newPost);
  },

  createCommentForPostById: async (
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ) => {
    // userId is checked in the middlewares
    const post: TPostControllerViewModel | null =
      await postsQueryRepository.getPostById(req.params.id);
    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    commentsController.createCommentForPostById(req, res);
  },

  updatePost: async (
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostControllerInputModel
    >,
    res: Response
  ) => {
    const { title, shortDescription, content, blogId } = req.body;
    const result: Result = await postsService.updatePostById({
      id: req.params.id,
      title,
      shortDescription,
      content,
      blogId,
    });

    result.status === RESULT_STATUS.SUCCESS
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  },

  deletePost: async (
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) => {
    const result: Result = await postsService.deletePostById(req.params.id);

    res.sendStatus(
      result.status === RESULT_STATUS.SUCCESS
        ? HTTP_STATUS.NO_CONTENT_204
        : HTTP_STATUS.NOT_FOUND_404
    );
  },
};

export default postsController;
