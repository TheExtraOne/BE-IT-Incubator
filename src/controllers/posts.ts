import { Router, Request, Response } from "express";
import { STATUS } from "../settings";
import postsService from "../domain/posts-service";
import TPathParamsPostModel from "./models/PathParamsPostModel";
import authorizationMiddleware from "../middleware/authorization-middleware";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
} from "../types";
import TPostInputModel from "./models/PostInputModel";
import postsInputValidator from "../middleware/post-input-validation-middleware";
import InputCheckErrorsMiddleware from "../middleware/input-check-errors-middleware";
import TPostViewModel from "./models/PostViewModel";

const postsRouter = Router({});

const postsController = {
  getPosts: async (_req: Request, res: Response) => {
    const posts: TPostViewModel[] = await postsService.getAllPosts();

    res.status(STATUS.OK_200).json(posts);
  },

  getPost: async (
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) => {
    const post: TPostViewModel | null = await postsService.getPostById(
      req.params.id
    );

    post
      ? res.status(STATUS.OK_200).json(post)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  createPost: async (req: TRequestWithBody<TPostInputModel>, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;

    const newPost: TPostViewModel | null = await postsService.createPost(
      title,
      shortDescription,
      content,
      blogId
    );

    res.status(STATUS.CREATED_201).json(newPost);
  },

  updatePost: async (
    req: TRequestWithParamsAndBody<TPathParamsPostModel, TPostInputModel>,
    res: Response
  ) => {
    const { title, shortDescription, content, blogId } = req.body;
    const success = await postsService.updatePostById(
      req.params.id,
      title,
      shortDescription,
      content,
      blogId
    );

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

const postInputMiddlewares = [
  authorizationMiddleware,
  postsInputValidator.titleValidation,
  postsInputValidator.shortDescriptionValidation,
  postsInputValidator.contentValidator,
  postsInputValidator.blogIdValidator,
  InputCheckErrorsMiddleware,
];

postsRouter.get("/", postsController.getPosts);
postsRouter.get("/:id", postsController.getPost);
postsRouter.post("/", [...postInputMiddlewares], postsController.createPost);
postsRouter.put("/:id", [...postInputMiddlewares], postsController.updatePost);
postsRouter.delete("/:id", authorizationMiddleware, postsController.deletePost);

export default postsRouter;
