import { Router, Response } from "express";
import { STATUS } from "../settings";
import blogsService from "../domain/blogs-service";
import TPathParamsBlogModel from "./models/PathParamsBlogModel";
import authorizationMiddleware from "../middleware/authorization-middleware";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../types";
import TBlogInputModel from "./models/BlogInputModel";
import blogInputValidator from "../middleware/blog-input-validation-middleware";
import InputCheckErrorsMiddleware from "../middleware/input-check-errors-middleware";
import TBlogViewModel from "./models/BlogViewModel";
import TQueryBlogModel from "./models/QueryBlogModel";
import TQueryPostModel from "./models/QueryPostModel";
import postsService from "../domain/posts-service";
import TPostViewModel from "./models/PostViewModel";
import postsInputValidator from "../middleware/post-input-validation-middleware";

const blogsRouter = Router({});

const blogsController = {
  getBlogs: async (req: TRequestWithQuery<TQueryBlogModel>, res: Response) => {
    const {
      searchNameTerm = null,
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = req.query;
    const blogs: TResponseWithPagination<TBlogViewModel[] | []> =
      await blogsService.getAllBlogs(
        searchNameTerm,
        +pageNumber,
        +pageSize,
        sortBy,
        sortDirection
      );

    res.status(STATUS.OK_200).json(blogs);
  },

  getBlog: async (
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) => {
    const blog: TBlogViewModel | null = await blogsService.getBlogById(
      req.params.id
    );

    blog
      ? res.status(STATUS.OK_200).json(blog)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  getAllPostsForBlogById: async (
    req: TRequestWithQueryAndParams<TQueryPostModel, TPathParamsBlogModel>,
    res: Response
  ) => {
    const isBlogIdExist = await postsService.checkIfBlogIdCorrect(
      req.params.id
    );
    if (!isBlogIdExist) {
      res.sendStatus(STATUS.NOT_FOUND_404);
      return;
    }

    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = req.query;
    const posts: TResponseWithPagination<TPostViewModel[] | []> =
      await postsService.getAllPostsForBlogById(
        req.params.id,
        +pageNumber,
        +pageSize,
        sortBy,
        sortDirection
      );

    res.status(STATUS.OK_200).json(posts);
  },

  createBlog: async (req: TRequestWithBody<TBlogInputModel>, res: Response) => {
    const { name, description, websiteUrl } = req.body;
    const newBlog: TBlogViewModel = await blogsService.createBlog(
      name,
      description,
      websiteUrl
    );

    res.status(STATUS.CREATED_201).json(newBlog);
  },

  createPostForBlogId: async (
    req: TRequestWithParamsAndBody<
      TPathParamsBlogModel,
      { title: string; shortDescription: string; content: string }
    >,
    res: Response
  ) => {
    const blogId = req.params.id;
    const { title, shortDescription, content } = req.body;
    const newPost: TPostViewModel | null = await postsService.createPost(
      title,
      shortDescription,
      content,
      blogId
    );

    if (!newPost) {
      res.sendStatus(STATUS.NOT_FOUND_404);
      return;
    }
    res.status(STATUS.CREATED_201).json(newPost);
  },

  updateBlog: async (
    req: TRequestWithParamsAndBody<TPathParamsBlogModel, TBlogInputModel>,
    res: Response
  ) => {
    const { name, description, websiteUrl } = req.body;
    const is_successful = await blogsService.updateBlogById(
      req.params.id,
      name,
      description,
      websiteUrl
    );

    res.sendStatus(
      is_successful ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404
    );
  },

  deleteBlog: async (
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) => {
    const is_successful = await blogsService.deleteBlogById(req.params.id);

    res.sendStatus(
      is_successful ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404
    );
  },
};

const blogInputMiddlewares = [
  authorizationMiddleware,
  blogInputValidator.nameValidation,
  blogInputValidator.descriptionValidation,
  blogInputValidator.websiteUrlValidation,
  InputCheckErrorsMiddleware,
];

const postInputMiddlewares = [
  authorizationMiddleware,
  postsInputValidator.titleValidation,
  postsInputValidator.shortDescriptionValidation,
  postsInputValidator.contentValidator,
  InputCheckErrorsMiddleware,
];

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlog);
blogsRouter.get("/:id/posts", blogsController.getAllPostsForBlogById);
blogsRouter.post(
  "/:id/posts",
  [...postInputMiddlewares],
  blogsController.createPostForBlogId
);
blogsRouter.post("/", [...blogInputMiddlewares], blogsController.createBlog);
blogsRouter.put("/:id", [...blogInputMiddlewares], blogsController.updateBlog);
blogsRouter.delete("/:id", authorizationMiddleware, blogsController.deleteBlog);

export default blogsRouter;
