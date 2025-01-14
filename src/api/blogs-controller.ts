import { Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import blogsService from "../business-logic/blogs-service";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../types";
import postsService from "../business-logic/posts-service";
import {
  TBlogControllerInputModel,
  TBlogControllerViewModel,
  TPathParamsBlogModel,
  TPostControllerViewModel,
  TQueryBlogModel,
  TQueryPostModel,
} from "./models";

const blogsController = {
  getBlogs: async (req: TRequestWithQuery<TQueryBlogModel>, res: Response) => {
    const {
      searchNameTerm = null,
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    const blogs: TResponseWithPagination<TBlogControllerViewModel[] | []> =
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
    const blog: TBlogControllerViewModel | null =
      await blogsService.getBlogById(req.params.id);

    blog
      ? res.status(STATUS.OK_200).json(blog)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },

  getAllPostsForBlogById: async (
    req: TRequestWithQueryAndParams<TQueryPostModel, TPathParamsBlogModel>,
    res: Response
  ) => {
    const isBlogIdExist = await postsService.checkIfBlogIdExist(req.params.id);
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
    const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
      await postsService.getAllPostsForBlogById({
        blogId: req.params.id,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(STATUS.OK_200).json(posts);
  },

  createBlog: async (
    req: TRequestWithBody<TBlogControllerInputModel>,
    res: Response
  ) => {
    const { name, description, websiteUrl } = req.body;
    const newBlog: TBlogControllerViewModel = await blogsService.createBlog({
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
    const newPost: TPostControllerViewModel | null =
      await postsService.createPost({
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
    req: TRequestWithParamsAndBody<
      TPathParamsBlogModel,
      TBlogControllerInputModel
    >,
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

export default blogsController;
