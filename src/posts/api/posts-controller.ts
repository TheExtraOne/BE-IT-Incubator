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

class PostsController {
  constructor(
    private commentsController: CommentsController,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
    private likesService: LikesService
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

    const userId: string | null = req.userId;
    // TODO: refactor
    // Adding latest likes info
    const postsWithLatestLikes = posts.items.map(async (post) => {
      const latestLikes = await this.likesService.getLatestLikesByParentId(
        post.id
      );
      const has_likes = !!latestLikes?.length;
      return {
        ...post,
        extendedLikesInfo: {
          ...post.extendedLikesInfo,
          newestLikes: has_likes ? latestLikes : [],
        },
      };
    });

    const postsWithLikes = {
      ...posts,
      items: await Promise.all(postsWithLatestLikes),
    };
    if (!userId) {
      res.status(HTTP_STATUS.OK_200).json(postsWithLikes);
      return;
    }

    // Get the likes/dislike for a userId.
    const likesForUser: LikesRepViewModel[] | null =
      await this.likesService.getLikesByUserId(userId);

    const postsWithUserStatusAndLikes = postsWithLikes.items.map((post) => {
      // Find in the likes array likes for current commentId, add status
      const like = likesForUser?.find((like) => like.parentId === post.id);
      return {
        ...post,
        extendedLikesInfo: {
          ...post.extendedLikesInfo,
          myStatus: like ? like.status : LIKE_STATUS.NONE,
        },
      };
    });

    res
      .status(HTTP_STATUS.OK_200)
      .json({ ...posts, items: postsWithUserStatusAndLikes });
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
    // TODO: refactor logic
    // Get the latest 3 likes for the post
    const latestLikes = await this.likesService.getLatestLikesByParentId(
      postId
    );
    const has_likes = !!latestLikes?.length;

    if (!userId) {
      if (has_likes) {
        res.status(HTTP_STATUS.OK_200).json({
          ...post,
          extendedLikesInfo: {
            ...post.extendedLikesInfo,
            newestLikes: latestLikes,
          },
        });
        return;
      } else {
        res.status(HTTP_STATUS.OK_200).json(post);
        return;
      }
    } else {
      const like = await this.likesService.getLikeByUserAndParentId(
        userId,
        postId
      );
      const myStatus = like?.status ?? LIKE_STATUS.NONE;
      if (has_likes) {
        res.status(HTTP_STATUS.OK_200).json({
          ...post,
          extendedLikesInfo: {
            ...post.extendedLikesInfo,
            myStatus,
            newestLikes: latestLikes,
          },
        });
        return;
      } else {
        res.status(HTTP_STATUS.OK_200).json({
          ...post,
          extendedLikesInfo: {
            ...post.extendedLikesInfo,
            myStatus,
          },
        });
        return;
      }
    }
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
