import { Router, Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import blogsService from "../domain/blogs-service";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../types";
import postsService from "../domain/posts-service";
import {
  TBlogInputModel,
  TBlogViewModel,
  TPathParamsBlogModel,
  TPostViewModel,
  TQueryBlogModel,
  TQueryPostModel,
} from "./models";
import {
  authorizationMiddleware,
  blogBodyInputValidator,
  inputCheckErrorsMiddleware,
  postsBodyInputValidator,
  queryInputValidator,
} from "../middleware";

const blogsRouter = Router({});

const blogsController = {
  getBlogs: async (req: TRequestWithQuery<TQueryBlogModel>, res: Response) => {
    const {
      searchNameTerm = null,
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    const blogs: TResponseWithPagination<TBlogViewModel[] | []> =
      await blogsService.getAllBlogs({
        searchNameTerm,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

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
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    const posts: TResponseWithPagination<TPostViewModel[] | []> =
      await postsService.getAllPostsForBlogById({
        blogId: req.params.id,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(STATUS.OK_200).json(posts);
  },

  createBlog: async (req: TRequestWithBody<TBlogInputModel>, res: Response) => {
    const { name, description, websiteUrl } = req.body;
    const newBlog: TBlogViewModel = await blogsService.createBlog({
      name,
      description,
      websiteUrl,
    });

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
    const newPost: TPostViewModel | null = await postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });

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
    const is_successful = await blogsService.updateBlogById({
      id: req.params.id,
      name,
      description,
      websiteUrl,
    });

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

const blogBodyInputMiddlewares = [
  authorizationMiddleware,
  ...Object.values(blogBodyInputValidator),
  inputCheckErrorsMiddleware,
];
const postBodyInputMiddlewares = [
  authorizationMiddleware,
  postsBodyInputValidator.contentValidator,
  postsBodyInputValidator.shortDescriptionValidation,
  postsBodyInputValidator.titleValidation,
  inputCheckErrorsMiddleware,
];
const blogQueryInputValidator = [
  ...Object.values(queryInputValidator),
  inputCheckErrorsMiddleware,
];
const postQueryInputValidator = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];

blogsRouter.get("/", [...blogQueryInputValidator], blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlog);
blogsRouter.get(
  "/:id/posts",
  [...postQueryInputValidator],
  blogsController.getAllPostsForBlogById
);
blogsRouter.post(
  "/:id/posts",
  [...postBodyInputMiddlewares],
  blogsController.createPostForBlogId
);
blogsRouter.post(
  "/",
  [...blogBodyInputMiddlewares],
  blogsController.createBlog
);
blogsRouter.put(
  "/:id",
  [...blogBodyInputMiddlewares],
  blogsController.updateBlog
);
blogsRouter.delete("/:id", authorizationMiddleware, blogsController.deleteBlog);

export default blogsRouter;
