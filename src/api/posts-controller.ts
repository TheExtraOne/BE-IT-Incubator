import { Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import postsService from "../business-logic/posts-service";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TResponseWithPagination,
} from "../types";
import {
  TPathParamsPostModel,
  TPostInputModel,
  TPostControllerViewModel,
  TQueryPostModel,
} from "./models";

const postsController = {
  getPosts: async (req: TRequestWithQuery<TQueryPostModel>, res: Response) => {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
      await postsService.getAllPosts({
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
    const post: TPostControllerViewModel | null =
      await postsService.getPostById(req.params.id);

    post
      ? res.status(STATUS.OK_200).json(post)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  createPost: async (req: TRequestWithBody<TPostInputModel>, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;

    const newPost: TPostControllerViewModel | null =
      await postsService.createPost({
        title,
        shortDescription,
        content,
        blogId,
      });

    res.status(STATUS.CREATED_201).json(newPost);
  },

  updatePost: async (
    req: TRequestWithParamsAndBody<TPathParamsPostModel, TPostInputModel>,
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
