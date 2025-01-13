import { Router, Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import postsService from "../domain/posts-service";
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
  TPostViewModel,
  TQueryPostModel,
} from "./models";
import {
  authorizationMiddleware,
  inputCheckErrorsMiddleware,
  postsBodyInputValidator,
  queryInputValidator,
} from "../middleware";

const postsRouter = Router({});

const postsController = {
  getPosts: async (req: TRequestWithQuery<TQueryPostModel>, res: Response) => {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    const posts: TResponseWithPagination<TPostViewModel[] | []> =
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
    const post: TPostViewModel | null = await postsService.getPostById(
      req.params.id
    );

    post
      ? res.status(STATUS.OK_200).json(post)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  createPost: async (req: TRequestWithBody<TPostInputModel>, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;

    const newPost: TPostViewModel | null = await postsService.createPost({
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

const postBodyInputMiddlewares = [
  authorizationMiddleware,
  postsBodyInputValidator.titleValidation,
  postsBodyInputValidator.shortDescriptionValidation,
  postsBodyInputValidator.contentValidator,
  postsBodyInputValidator.blogIdValidator,
  inputCheckErrorsMiddleware,
];
const postQueryInputValidator = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];

postsRouter.get("/", [...postQueryInputValidator], postsController.getPosts);
postsRouter.get("/:id", postsController.getPost);
postsRouter.post(
  "/",
  [...postBodyInputMiddlewares],
  postsController.createPost
);
postsRouter.put(
  "/:id",
  [...postBodyInputMiddlewares],
  postsController.updatePost
);
postsRouter.delete("/:id", authorizationMiddleware, postsController.deletePost);

export default postsRouter;
