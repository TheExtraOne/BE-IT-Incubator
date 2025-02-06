import { Response } from "express";
import {
  SORT_DIRECTION,
  HTTP_STATUS,
  RESULT_STATUS,
  LIKE_TYPE,
  LIKE_STATUS,
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
import TQueryPostModel from "../types/QueryPostModel";
import TPostControllerViewModel from "../types/PostControllerViewModel";
import TPathParamsPostModel from "../types/PathParamsPostModel";
import TPostControllerInputModel from "../types/PostControllerInputModel";
import CommentsController from "../../comments/api/comments-controller";
import PostsQueryRepository from "../infrastructure/posts-query-repository";
import TQueryCommentsModel from "../../comments/types/QueryCommentsModel";
import TPostCommentControllerInputModel from "../../comments/types/PostCommentControllerInputModel";
import TPostsLikeInputModel from "../types/PostLikeInputModel";
import LikesService from "../../likes/app/likes-service";
import LikesRepViewModel from "../../likes/types/LikeRepViewModel";
import { inject, injectable } from "inversify";

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

  public async enrichPostsWithLatestLikes(
    posts: TPostControllerViewModel[]
  ): Promise<TPostControllerViewModel[]> {
    // Get all latest likes for all posts in one batch
    const latestLikesPromises = posts.map((post) =>
      this.likesService.getLatestLikesByParentId(post.id)
    );
    const allLatestLikes = await Promise.all(latestLikesPromises);

    // Combine posts with their latest likes
    return posts.map((post, index) => {
      const latestLikes = allLatestLikes[index];
      const hasLikes = !!latestLikes?.length;

      return {
        ...post,
        extendedLikesInfo: {
          ...post.extendedLikesInfo,
          newestLikes: hasLikes ? latestLikes : [],
        },
      };
    });
  }

  public async enrichPostWithLikes(
    post: TPostControllerViewModel,
    userId: string | null
  ): Promise<TPostControllerViewModel> {
    // Getting 3 latest likes for the post
    const latestLikes = await this.likesService.getLatestLikesByParentId(
      post.id
    );
    const hasLikes = !!latestLikes?.length;

    // Base post with latest likes if they exist
    const enrichedPost = hasLikes
      ? {
          ...post,
          extendedLikesInfo: {
            ...post.extendedLikesInfo,
            newestLikes: latestLikes,
          },
        }
      : post;

    // If no user, return post as it
    if (!userId) {
      return enrichedPost;
    }

    // Add user's like status
    const like = await this.likesService.getLikeByUserAndParentId(
      userId,
      post.id
    );
    const myStatus = like?.status ?? LIKE_STATUS.NONE;

    return {
      ...enrichedPost,
      extendedLikesInfo: {
        ...enrichedPost.extendedLikesInfo,
        myStatus,
      },
    };
  }

  public enrichPostsWithUserStatus(
    posts: TPostControllerViewModel[],
    likesForUser: LikesRepViewModel[] | null
  ): TPostControllerViewModel[] {
    return posts.map((post) => {
      const like = likesForUser?.find((like) => like.parentId === post.id);
      return {
        ...post,
        extendedLikesInfo: {
          ...post.extendedLikesInfo,
          myStatus: like?.status ?? LIKE_STATUS.NONE,
        },
      };
    });
  }

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

    // Enrich posts with latest likes
    const postsWithLikes = {
      ...posts,
      items: await this.enrichPostsWithLatestLikes(posts.items),
    };

    // If no user, return posts with likes only
    if (!userId) {
      res.status(HTTP_STATUS.OK_200).json(postsWithLikes);
      return;
    }

    // Get all likes for the user in one query
    const likesForUser = await this.likesService.getLikesByUserId(userId);

    // Add user's like status to each post
    const postsWithUserStatusAndLikes = {
      ...posts,
      items: this.enrichPostsWithUserStatus(postsWithLikes.items, likesForUser),
    };

    res.status(HTTP_STATUS.OK_200).json(postsWithUserStatusAndLikes);
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

    const enrichedPost = await this.enrichPostWithLikes(post, userId);
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
