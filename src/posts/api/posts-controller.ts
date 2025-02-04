import { Response } from "express";
import {
  SORT_DIRECTION,
  HTTP_STATUS,
  RESULT_STATUS,
} from "../../common/settings";
import PostsService from "../app/posts-service";
import {
  Result,
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQuery,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../../common/types/types";
import TQueryPostModel from "../domain/QueryPostModel";
import TPostControllerViewModel from "../domain/PostControllerViewModel";
import TPathParamsPostModel from "../domain/PathParamsPostModel";
import TPostControllerInputModel from "../domain/PostControllerInputModel";
import TPostCommentControllerInputModel from "../../comments/domain/PostCommentControllerInputModel";
import TQueryCommentsModel from "../../comments/domain/QueryCommentsModel";
import CommentsController from "../../comments/api/comments-controller";
import PostsQueryRepository from "../infrastructure/posts-query-repository";

class PostsController {
  constructor(
    private commentsController: CommentsController,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService
  ) {}

  async getPosts(req: TRequestWithQuery<TQueryPostModel>, res: Response) {
    // Validating in the middleware
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    // We are reaching out to postsQueryRepository directly because of CQRS
    const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
      await this.postsQueryRepository.getAllPosts({
        blogId: null,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
        sortBy,
        sortDirection,
      });

    res.status(HTTP_STATUS.OK_200).json(posts);
  }

  async getPostById(
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) {
    // We are reaching out to postsQueryRepository directly because of CQRS
    const post: TPostControllerViewModel | null =
      await this.postsQueryRepository.getPostById(req.params.id);

    post
      ? res.status(HTTP_STATUS.OK_200).json(post)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  }

  async getAllCommentsForPostById(
    req: TRequestWithQueryAndParams<TQueryCommentsModel, TPathParamsPostModel>,
    res: Response
  ) {
    const post: TPostControllerViewModel | null =
      await this.postsQueryRepository.getPostById(req.params.id);
    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    this.commentsController.getAllCommentsForPostId(req, res);
  }

  async createPost(
    req: TRequestWithBody<TPostControllerInputModel>,
    res: Response
  ) {
    const { title, shortDescription, content, blogId } = req.body;
    // Validating blogID in the middlewares
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

  async createCommentForPostById(
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ) {
    // userId is checked in the middlewares
    const post: TPostControllerViewModel | null =
      await this.postsQueryRepository.getPostById(req.params.id);
    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    this.commentsController.createCommentForPostById(req, res);
  }

  async updatePostById(
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostControllerInputModel
    >,
    res: Response
  ) {
    const { title, shortDescription, content, blogId } = req.body;
    const result: Result = await this.postsService.updatePostById({
      id: req.params.id,
      title,
      shortDescription,
      content,
      blogId,
    });

    result.status === RESULT_STATUS.SUCCESS
      ? res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  }

  async deletePostById(
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) {
    const result: Result = await this.postsService.deletePostById(
      req.params.id
    );

    res.sendStatus(
      result.status === RESULT_STATUS.SUCCESS
        ? HTTP_STATUS.NO_CONTENT_204
        : HTTP_STATUS.NOT_FOUND_404
    );
  }
}

export default PostsController;
