import { Response } from "express";
import PostsService from "../app/posts-service";
import TQueryPostModel from "../types/QueryPostModel";
import TPostControllerViewModel from "../types/PostControllerViewModel";
import TPathParamsPostModel from "../types/PathParamsPostModel";
import TPostControllerInputModel from "../types/PostControllerInputModel";
import TPostsLikeInputModel from "../types/PostLikeInputModel";
import LikesService from "../../likes/app/likes-service";
import { inject, injectable } from "inversify";
import {
  SORT_DIRECTION,
  HTTP_STATUS,
  RESULT_STATUS,
  LIKE_TYPE,
} from "../../../common/settings";
import {
  TRequestWithQuery,
  TRequestWithParams,
  TRequestWithQueryAndParams,
  TRequestWithBody,
  TRequestWithParamsAndBody,
  Result,
} from "../../../common/types/types";
import CommentsController from "../../comments/api/comments-controller";
import TPostCommentControllerInputModel from "../../comments/types/PostCommentControllerInputModel";
import TQueryCommentsModel from "../../comments/types/QueryCommentsModel";
import PostsQueryRepository from "../infrastructure/posts-query-repository";

@injectable()
class PostsController {
  constructor(
    @inject("CommentsController")
    private commentsController: CommentsController,
    @inject("PostsQueryRepository")
    private postsQueryRepository: PostsQueryRepository,
    @inject("PostsService")
    private postsService: PostsService,
    @inject("LikesService")
    private likesService: LikesService
  ) {}

  async getPosts(req: TRequestWithQuery<TQueryPostModel>, res: Response) {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    const userId: string | null = req.userId;

    // Get base posts data
    const posts = await this.postsQueryRepository.getAllPosts({
      blogId: null,
      pageNumber: +pageNumber,
      pageSize: +pageSize,
      sortBy,
      sortDirection,
    });

    // Enrich posts with likes and user status
    const enrichedPosts =
      await this.likesService.enrichPostsWithLikesAndUserStatus(posts, userId);

    res.status(HTTP_STATUS.OK_200).json(enrichedPosts);
  }

  async getPostById(
    req: TRequestWithParams<TPathParamsPostModel>,
    res: Response
  ) {
    const userId: string | null = req.userId;
    const postId = req.params.id;

    // We are reaching out to postsQueryRepository directly because of CQRS
    const post: TPostControllerViewModel | null =
      await this.postsQueryRepository.getPostById(postId);

    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const enrichedPost = await this.likesService.enrichPostWithLikesAndStatus(
      post,
      userId
    );

    res.status(HTTP_STATUS.OK_200).json(enrichedPost);
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

  async changeLikeStatus(
    req: TRequestWithParamsAndBody<TPathParamsPostModel, TPostsLikeInputModel>,
    res: Response
  ): Promise<void> {
    // Validation if user authorized and if the inputModel has incorrect values happens in the middleware
    // Check if post exists
    const postId = req.params.id;
    const post: TPostControllerViewModel | null =
      await this.postsQueryRepository.getPostById(postId);
    if (!post) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Check and extract userId in the middlewares
    const userId = req.userId!;
    const likeStatus = req.body.likeStatus;
    await this.likesService.changeLikeStatus({
      userId,
      parentId: postId,
      likeStatus,
      likeType: LIKE_TYPE.POST,
    });

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}

export default PostsController;
