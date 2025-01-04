import { Router, Request, Response } from "express";
import { STATUS } from "../settings";
import blogsRepository from "../repository/blogs-repository";
import TPathParamsBlogModel from "../models/PathParamsBlogModel";
import authorizationMiddleware from "../middleware/authorization-middleware";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
} from "../types";
import TBlogInputModel from "../models/BlogInputModel";
import blogInputValidator from "../middleware/blog-input-validation-middleware";
import InputCheckErrorsMiddleware from "../middleware/input-check-errors-middleware";

const blogsRouter = Router({});

const blogsController = {
  getBlogs: (_req: Request, res: Response) => {
    const blogs = blogsRepository.getAllBlogs();

    res.status(STATUS.OK_200).json(blogs);
  },

  getBlog: (req: TRequestWithParams<TPathParamsBlogModel>, res: Response) => {
    const blog = blogsRepository.getBlogById(req.params.id);

    blog
      ? res.status(STATUS.OK_200).json(blog)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  createBlog: (req: TRequestWithBody<TBlogInputModel>, res: Response) => {
    const { name, description, websiteUrl } = req.body;
    const newBlog = blogsRepository.createBlog(name, description, websiteUrl);

    res.status(STATUS.CREATED_201).json(newBlog);
  },

  updateBlog: (
    req: TRequestWithParamsAndBody<TPathParamsBlogModel, TBlogInputModel>,
    res: Response
  ) => {
    const { name, description, websiteUrl } = req.body;
    const { success } = blogsRepository.updateBlogById(
      req.params.id,
      name,
      description,
      websiteUrl
    );

    res.sendStatus(success ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404);
  },

  deleteBlog: (
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) => {
    const { success } = blogsRepository.deleteBlogById(req.params.id);

    res.sendStatus(success ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404);
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
