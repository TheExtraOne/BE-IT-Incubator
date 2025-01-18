import { Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import postsService from "./posts-service";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TResponseWithPagination,
} from "../types/types";
import TQueryPostModel from "./models/QueryPostModel";
import TPostControllerViewModel from "./models/PostControllerViewModel";
import postsQueryRepository from "./posts-query-repository";
import TPathParamsPostModel from "./models/PathParamsPostModel";
import TPostControllerInputModel from "./models/PostControllerInputModel";

const postsController = {
  getPosts: async (req: TRequestWithQuery<TQueryPostModel>, res: Response) => {
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

    res.status(STATUS.OK_200).json(posts);
  },

  getPost: async (
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) => {
    // We are reaching out to postsQueryRepository directly because of CQRS
    const post: TPostControllerViewModel | null =
      await postsQueryRepository.getPostById(req.params.id);

    post
      ? res.status(STATUS.OK_200).json(post)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  createPost: async (
    req: TRequestWithBody<TPostControllerInputModel>,
    res: Response
  ) => {
    const { title, shortDescription, content, blogId } = req.body;
    // Validating blogID in the middlewares
    const newPostId: string | null = await postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });
    const newPost: TPostControllerViewModel | null =
      await postsQueryRepository.getPostById(newPostId!);

    res.status(STATUS.CREATED_201).json(newPost);
  },

  updatePost: async (
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostControllerInputModel
    >,
    res: Response
  ) => {
    const { title, shortDescription, content, blogId } = req.body;
    const success = await postsService.updatePostById({
      id: req.params.id,
      title,
      shortDescription,
      content,
      blogId,
    });

    success
      ? res.sendStatus(STATUS.NO_CONTENT_204)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  deletePost: async (
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) => {
    const success = await postsService.deletePostById(req.params.id);

    res.sendStatus(success ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404);
  },
};

export default postsController;
