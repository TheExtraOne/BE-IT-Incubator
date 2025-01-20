import { Response } from "express";
import { SORT_DIRECTION, HTTP_STATUS, RESULT_STATUS } from "../common/settings";
import {
  Result,
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../common/types/types";
import postsService from "../posts/posts-service";
import TQueryBlogModel from "./models/QueryBlogModel";
import TBlogControllerViewModel from "./models/BlogControllerViewModel";
import blogsQueryRepository from "./blogs-query-repository";
import TPathParamsBlogModel from "./models/PathParamsBlogModel";
import blogsService from "./blogs-service";
import TQueryPostModel from "../posts/models/QueryPostModel";
import TPostControllerViewModel from "../posts/models/PostControllerViewModel";
import postsQueryRepository from "../posts/posts-query-repository";
import TBlogControllerInputModel from "./models/BlogControllerInputModel";

const blogsController = {
  getBlogs: async (req: TRequestWithQuery<TQueryBlogModel>, res: Response) => {
    const {
      searchNameTerm = null,
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    // We are reaching out to blogsQueryRepository directly because of CQRS
    const blogs: TResponseWithPagination<TBlogControllerViewModel[] | []> =
      await blogsQueryRepository.getAllBlogs({
        searchNameTerm,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(HTTP_STATUS.OK_200).json(blogs);
  },

  getBlog: async (
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) => {
    // We are reaching out to blogsQueryRepository directly because of CQRS
    const blog: TBlogControllerViewModel | null =
      await blogsQueryRepository.getBlogById(req.params.id);

    blog
      ? res.status(HTTP_STATUS.OK_200).json(blog)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  },

  getAllPostsForBlogById: async (
    req: TRequestWithQueryAndParams<TQueryPostModel, TPathParamsBlogModel>,
    res: Response
  ) => {
    // We are reaching out to blogsQueryRepository directly because of CQRS
    const blog: TBlogControllerViewModel | null =
      await blogsQueryRepository.getBlogById(req.params.id);
    if (!blog) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    // We are reaching out to postsQueryRepository directly because of CQRS
    const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
      await postsQueryRepository.getAllPosts({
        blogId: req.params.id,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(HTTP_STATUS.OK_200).json(posts);
  },

  createBlog: async (
    req: TRequestWithBody<TBlogControllerInputModel>,
    res: Response
  ) => {
    const { name, description, websiteUrl } = req.body;
    const newBlogId: string = await blogsService.createBlog({
      name,
      description,
      websiteUrl,
    });
    const newBlog: TBlogControllerViewModel | null =
      await blogsQueryRepository.getBlogById(newBlogId);

    res.status(HTTP_STATUS.CREATED_201).json(newBlog);
  },

  createPostForBlogId: async (
    req: TRequestWithParamsAndBody<
      TPathParamsBlogModel,
      { title: string; shortDescription: string; content: string }
    >,
    res: Response
  ) => {
    // Checking that blogId exists
    const blogId = req.params.id;
    const blog = await blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const { title, shortDescription, content } = req.body;
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
      is_successful ? HTTP_STATUS.NO_CONTENT_204 : HTTP_STATUS.NOT_FOUND_404
    );
  },

  deleteBlog: async (
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) => {
    const is_successful = await blogsService.deleteBlogById(req.params.id);

    res.sendStatus(
      is_successful ? HTTP_STATUS.NO_CONTENT_204 : HTTP_STATUS.NOT_FOUND_404
    );
  },
};

export default blogsController;
