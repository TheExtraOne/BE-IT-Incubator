import { ObjectId } from "mongodb";
import LikesRepViewModel from "../types/LikeRepViewModel";
import { HydratedDocument } from "mongoose";
import LikesRepository from "../infrastructure/likes-repository";
import { LikeModelDb } from "../domain/like-model";
import { inject, injectable } from "inversify";
import {
  LIKE_STATUS,
  LIKE_TYPE,
  RESULT_STATUS,
  SORT_DIRECTION,
} from "../../../common/settings";
import { Result, TResponseWithPagination } from "../../../common/types/types";
import CommentsService from "../../comments/app/comments-service";
import TCommentControllerViewModel from "../../comments/types/PostCommentControllerViewModel";
import PostsService from "../../posts/app/posts-service";
import TPostControllerViewModel from "../../posts/types/PostControllerViewModel";
import UsersService from "../../users/app/users-service";
import UserAccountRepViewModel from "../../users/types/UserAccountRepViewModel";

@injectable()
class LikesService {
  constructor(
    @inject("LikesRepository") protected likesRepository: LikesRepository,
    @inject("CommentsService") protected commentService: CommentsService,
    @inject("PostsService") protected postsService: PostsService,
    @inject("UsersService") protected usersService: UsersService
  ) {}
  async createLike({
    userId,
    parentId,
    likeStatus,
    likeType,
  }: {
    userId: string;
    parentId: string;
    likeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    if (likeStatus === LIKE_STATUS.NONE) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        extensions: [{ field: "likeStatus", message: "Incorrect status" }],
      };
    }

    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersService.getUserById(userId);

    const newLike = new LikesRepViewModel(
      new ObjectId(),
      likeStatus,
      userId,
      parentId,
      new Date(),
      likeType,
      user?.accountData.userName!
    );
    const likeEntity = new LikeModelDb(newLike);
    await this.likesRepository.saveLike(likeEntity);

    if (likeType === LIKE_TYPE.COMMENT) {
      // Update total amount of likes/dislikes for comments
      await this.commentService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: likeStatus === LIKE_STATUS.LIKE ? 1 : 0,
        deltaDislikesCount: likeStatus === LIKE_STATUS.DISLIKE ? 1 : 0,
      });
    }
    if (likeType === LIKE_TYPE.POST) {
      // Update total amount of likes/dislikes for posts
      await this.postsService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: likeStatus === LIKE_STATUS.LIKE ? 1 : 0,
        deltaDislikesCount: likeStatus === LIKE_STATUS.DISLIKE ? 1 : 0,
      });
    }

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async updateLike({
    likeStatus,
    like,
    parentId,
    likeType,
  }: {
    likeStatus: LIKE_STATUS;
    like: HydratedDocument<LikesRepViewModel>;
    parentId: string;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    const currentLikeStatus = like.status;
    const result: Result = {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
    // If the status is the same
    if (likeStatus === currentLikeStatus) {
      return result;
    }
    // If status is none and current status is like or dislike - we delete the like
    if (likeStatus === LIKE_STATUS.NONE) {
      return await this.deleteLike({
        like,
        parentId,
        previousLikeStatus: currentLikeStatus,
        likeType,
      });
    }

    like.status = likeStatus;
    await this.likesRepository.saveLike(like);

    if (likeType === LIKE_TYPE.COMMENT) {
      // Update total amount of likes/dislikes in comments bd
      await this.commentService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: currentLikeStatus === LIKE_STATUS.LIKE ? -1 : 1,
        deltaDislikesCount: currentLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 1,
      });
    }

    if (likeType === LIKE_TYPE.POST) {
      // Update total amount of likes/dislikes for posts
      await this.postsService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: currentLikeStatus === LIKE_STATUS.LIKE ? -1 : 1,
        deltaDislikesCount: currentLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 1,
      });
    }
    return result;
  }

  async deleteLike({
    like,
    parentId,
    previousLikeStatus,
    likeType,
  }: {
    like: HydratedDocument<LikesRepViewModel>;
    parentId: string;
    previousLikeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    await this.likesRepository.deleteLike(like);

    if (likeType === LIKE_TYPE.COMMENT) {
      // Update total amount of likes/dislikes in comments bd
      await this.commentService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: previousLikeStatus === LIKE_STATUS.LIKE ? -1 : 0,
        deltaDislikesCount: previousLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 0,
      });
    }

    if (likeType === LIKE_TYPE.POST) {
      // Update total amount of likes/dislikes for posts
      await this.postsService.updateLikesAmountById({
        id: parentId,
        deltaLikesCount: previousLikeStatus === LIKE_STATUS.LIKE ? -1 : 0,
        deltaDislikesCount: previousLikeStatus === LIKE_STATUS.DISLIKE ? -1 : 0,
      });
    }

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async getLikeByUserAndParentId(
    userId: string,
    parentId: string
  ): Promise<HydratedDocument<LikesRepViewModel> | null> {
    return await this.likesRepository.getLikeByUserAndParentId(
      userId,
      parentId
    );
  }

  async getLikesByUserId(userId: string): Promise<LikesRepViewModel[] | null> {
    return await this.likesRepository.getLikesByUserId(userId);
  }

  async changeLikeStatus({
    userId,
    parentId,
    likeStatus,
    likeType,
  }: {
    userId: string;
    parentId: string;
    likeStatus: LIKE_STATUS;
    likeType: LIKE_TYPE;
  }): Promise<Result> {
    // Check if user already liked/disliked the comment or the post
    const like: HydratedDocument<LikesRepViewModel> | null =
      await this.getLikeByUserAndParentId(userId, parentId);

    if (like) {
      // If user has already liked/disliked the comment or the post, update the like status
      return await this.updateLike({
        likeStatus,
        like,
        parentId,
        likeType,
      });
    }
    // If user has not liked/disliked the comment or the post before, create a new like
    return await this.createLike({
      userId,
      parentId,
      likeStatus,
      likeType,
    });
  }

  async getLatestLikesByParentId(
    parentId: string,
    likesCount = 3
  ): Promise<
    | {
        addedAt: Date;
        userId: string;
        login: string;
      }[]
    | []
  > {
    const likes = await this.likesRepository.getLikesByParentIdWithDateSort({
      parentId,
      sortDirection: SORT_DIRECTION.DESC,
      status: LIKE_STATUS.LIKE,
    });

    if (!likes) {
      return [];
    }

    // Finding 3 latest likes
    return likes.slice(0, likesCount).map((like) => ({
      addedAt: like.createdAt,
      userId: like.authorId,
      login: like.login,
    }));
  }

  async enrichPostsWithLatestLikes(
    posts: TPostControllerViewModel[] | []
  ): Promise<TPostControllerViewModel[] | []> {
    // Get 3 latest likes for all posts in one batch
    const latestLikesPromises = posts.map((post) =>
      this.getLatestLikesByParentId(post.id, 3)
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

  async enrichPostWithLikesAndStatus(
    post: TPostControllerViewModel,
    userId: string | null
  ): Promise<TPostControllerViewModel> {
    // Getting 3 latest likes for the post
    const latestLikes = await this.getLatestLikesByParentId(post.id, 3);
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
    const like = await this.getLikeByUserAndParentId(userId, post.id);
    const myStatus = like?.status ?? LIKE_STATUS.NONE;

    return {
      ...enrichedPost,
      extendedLikesInfo: {
        ...enrichedPost.extendedLikesInfo,
        myStatus,
      },
    };
  }

  enrichPostsWithUserStatus(
    posts: TPostControllerViewModel[] | [],
    likesForUser: LikesRepViewModel[] | null
  ): TPostControllerViewModel[] | [] {
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

  async enrichPostsWithLikesAndUserStatus(
    posts: TResponseWithPagination<TPostControllerViewModel[] | []>,
    userId: string | null
  ): Promise<TResponseWithPagination<TPostControllerViewModel[] | []>> {
    // First enrich posts with latest likes
    const postsWithLikes = {
      ...posts,
      items: await this.enrichPostsWithLatestLikes(posts.items),
    };

    // If no user, return posts with likes only
    if (!userId) {
      return postsWithLikes;
    }

    // Get all likes for the user in one query
    const likesForUser = await this.getLikesByUserId(userId);

    // Add user's like status to each post
    return {
      ...posts,
      items: this.enrichPostsWithUserStatus(postsWithLikes.items, likesForUser),
    };
  }

  async enrichCommentWithLikeStatus(
    comment: TCommentControllerViewModel,
    userId: string | null
  ): Promise<TCommentControllerViewModel> {
    if (!userId) {
      return comment;
    }

    const like = await this.getLikeByUserAndParentId(userId, comment.id);

    return {
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: like?.status ?? LIKE_STATUS.NONE,
      },
    };
  }

  async enrichCommentsWithLikeStatus(
    comments: TResponseWithPagination<TCommentControllerViewModel[] | []>,
    userId: string | null
  ): Promise<TResponseWithPagination<TCommentControllerViewModel[] | []>> {
    if (!userId) {
      return comments;
    }

    // Get all likes for the user in one query
    const likesForUser = await this.getLikesByUserId(userId);

    // Add user's like status to each comment
    return {
      ...comments,
      items: comments.items.map((comment) => {
        const like = likesForUser?.find((like) => like.parentId === comment.id);
        return {
          ...comment,
          likesInfo: {
            ...comment.likesInfo,
            myStatus: like?.status ?? LIKE_STATUS.NONE,
          },
        };
      }),
    };
  }
}

export default LikesService;
