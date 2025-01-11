import { Router, Request, Response } from "express";
import { STATUS } from "../settings";
import blogsService from "../domain/blogs-service";
import TPathParamsBlogModel from "./models/PathParamsBlogModel";
import authorizationMiddleware from "../middleware/authorization-middleware";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TResponseWithPagination,
} from "../types";
import TBlogInputModel from "./models/BlogInputModel";
import blogInputValidator from "../middleware/blog-input-validation-middleware";
import InputCheckErrorsMiddleware from "../middleware/input-check-errors-middleware";
import TBlogViewModel from "./models/BlogViewModel";
import TQueryBlogModel from "./models/QueryBlogModel";

const blogsRouter = Router({});

const blogsController = {
  getBlogs: async (req: TRequestWithQuery<TQueryBlogModel>, res: Response) => {
    const { searchNameTerm = null, pageNumber = 1, pageSize = 10 } = req.query;
    const blogs: TResponseWithPagination<TBlogViewModel[] | []> =
      await blogsService.getAllBlogs(searchNameTerm, +pageNumber, +pageSize);

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

  createBlog: async (req: TRequestWithBody<TBlogInputModel>, res: Response) => {
    const { name, description, websiteUrl } = req.body;
    const newBlog: TBlogViewModel = await blogsService.createBlog(
      name,
      description,
      websiteUrl
    );

    res.status(STATUS.CREATED_201).json(newBlog);
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

blogsRouter.get("/", blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlog);
blogsRouter.post("/", [...blogInputMiddlewares], blogsController.createBlog);
blogsRouter.put("/:id", [...blogInputMiddlewares], blogsController.updateBlog);
blogsRouter.delete("/:id", authorizationMiddleware, blogsController.deleteBlog);

export default blogsRouter;
