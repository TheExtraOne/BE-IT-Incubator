import { Response } from "express";
import {
  SORT_DIRECTION,
  HTTP_STATUS,
  RESULT_STATUS,
} from "../../common/settings";
import {
  TRequestWithQuery,
  TResponseWithPagination,
  TRequestWithParams,
  TRequestWithQueryAndParams,
  TRequestWithBody,
  TRequestWithParamsAndBody,
  Result,
} from "../../common/types/types";
import TPostControllerViewModel from "../../posts/domain/PostControllerViewModel";
import TQueryPostModel from "../../posts/domain/QueryPostModel";
import PostsService from "../../posts/app/posts-service";
import BlogService from "../app/blogs-service";
import TBlogControllerInputModel from "../domain/BlogControllerInputModel";
import TBlogControllerViewModel from "../domain/BlogControllerViewModel";
import TPathParamsBlogModel from "../domain/PathParamsBlogModel";
import TQueryBlogModel from "../domain/QueryBlogModel";
import BlogsQueryRepository from "../infrastructure/blogs-query-repository";
import PostsQueryRepository from "../../posts/infrastructure/posts-query-repository";

class BlogsController {
  constructor(
    protected blogService: BlogService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository
  ) {}

  async getBlogs(req: TRequestWithQuery<TQueryBlogModel>, res: Response) {
    // Query validation is in the middleware
    const {
      searchNameTerm = null,
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    // We are reaching out to blogsQueryRepository directly because of CQRS
    const blogs: TResponseWithPagination<TBlogControllerViewModel[] | []> =
      await this.blogsQueryRepository.getAllBlogs({
        searchNameTerm,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(HTTP_STATUS.OK_200).json(blogs);
  }

  async getBlogById(
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) {
    // We are reaching out to blogsQueryRepository directly because of CQRS
    const blog: TBlogControllerViewModel | null =
      await this.blogsQueryRepository.getBlogById(req.params.id);

    blog
      ? res.status(HTTP_STATUS.OK_200).json(blog)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  }

  async getAllPostsForBlogById(
    req: TRequestWithQueryAndParams<TQueryPostModel, TPathParamsBlogModel>,
    res: Response
  ) {
    // Check if blog exists
    const blog: TBlogControllerViewModel | null =
      await this.blogsQueryRepository.getBlogById(req.params.id);
    if (!blog) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Query validation is in the middleware
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;
    // We are reaching out to postsQueryRepository directly because of CQRS
    const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
      await this.postsQueryRepository.getAllPosts({
        blogId: req.params.id,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(HTTP_STATUS.OK_200).json(posts);
  }

  async createBlog(
    req: TRequestWithBody<TBlogControllerInputModel>,
    res: Response
  ) {
    const { name, description, websiteUrl } = req.body;
    const newBlogId: string = await this.blogService.createBlog({
      name,
      description,
      websiteUrl,
    });
    const newBlog: TBlogControllerViewModel | null =
      await this.blogsQueryRepository.getBlogById(newBlogId);

    res.status(HTTP_STATUS.CREATED_201).json(newBlog);
  }

  async createPostForBlogById(
    req: TRequestWithParamsAndBody<
      TPathParamsBlogModel,
      { title: string; shortDescription: string; content: string }
    >,
    res: Response
  ) {
    // Checking that blogId exists
    const blogId: string = req.params.id;
    const blog: TBlogControllerViewModel | null =
      await this.blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const { title, shortDescription, content } = req.body;
    const result: Result<string | null> = await this.postsService.createPost({
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
      await this.postsQueryRepository.getPostById(result.data!);

    res.status(HTTP_STATUS.CREATED_201).json(newPost);
  }

  async updateBlogById(
    req: TRequestWithParamsAndBody<
      TPathParamsBlogModel,
      TBlogControllerInputModel
    >,
    res: Response
  ) {
    const { name, description, websiteUrl } = req.body;
    const result: Result = await this.blogService.updateBlogById({
      id: req.params.id,
      name,
      description,
      websiteUrl,
    });

    res.sendStatus(
      result.status === RESULT_STATUS.SUCCESS
        ? HTTP_STATUS.NO_CONTENT_204
        : HTTP_STATUS.NOT_FOUND_404
    );
  }

  async deleteBlogById(
    req: TRequestWithParams<TPathParamsBlogModel>,
    res: Response
  ) {
    const result: Result = await this.blogService.deleteBlogById(req.params.id);

    res.sendStatus(
      result.status === RESULT_STATUS.SUCCESS
        ? HTTP_STATUS.NO_CONTENT_204
        : HTTP_STATUS.NOT_FOUND_404
    );
  }
}

export default BlogsController;
