import { Response } from "express";
import {
  SORT_DIRECTION,
  HTTP_STATUS,
  RESULT_STATUS,
  LIKE_TYPE,
  LIKE_STATUS,
} from "../common/settings";
import {
  Result,
  TRequestWithParams,
  TRequestWithParamsAndBody,
  TRequestWithQueryAndParams,
  TResponseWithPagination,
} from "../common/types/types";
import TPostCommentControllerInputModel from "./models/PostCommentControllerInputModel";
import TPathParamsPostModel from "../posts/models/PathParamsPostModel";
import TCommentControllerViewModel from "./models/PostCommentControllerViewModel";
import CommentsService from "./comments-service";
import TQueryCommentsModel from "./models/QueryCommentsModel";
import CommentsQueryRepository from "./comments-query-repository";
import TPathParamsCommentsModel from "./models/PathParamsCommentModel";
import TCommentServiceViewModel from "./models/CommentServiceViewModel";
import TCommentsLikeInputModel from "./models/CommentLikeInputModel";
import LikesService from "../likes/likes-service";

class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
    private likesService: LikesService
  ) {}

  async createCommentForPostById(
    req: TRequestWithParamsAndBody<
      TPathParamsPostModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ): Promise<void> {
    const result: Result<string | null> =
      await this.commentsService.createComment({
        content: req.body.content,
        userId: req.userId!,
        postId: req.params.id,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    const commentId = result.data!;
    const createdComment: TCommentControllerViewModel | null =
      await this.commentsQueryRepository.getCommentById(commentId);

    res
      .status(HTTP_STATUS.CREATED_201)
      .json({ ...createdComment, likesInfo: { myStatus: LIKE_STATUS.NONE } });
  }

  async getAllCommentsForPostId(
    req: TRequestWithQueryAndParams<TQueryCommentsModel, TPathParamsPostModel>,
    res: Response
  ): Promise<void> {
    // Validating query in the middleware
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
    } = req.query;

    // We are reaching out to commentsQueryRepository directly because of CQRS
    const comments: TResponseWithPagination<
      TCommentControllerViewModel[] | []
    > = await this.commentsQueryRepository.getAllCommentsForPostId({
      pageNumber: +pageNumber,
      pageSize: +pageSize,
      sortBy,
      sortDirection,
      postId: req.params.id,
    });

    // TODO: refactor
    const defaultItemsResponse = comments.items.map((comment) => {
      return {
        ...comment,
        likesInfo: {
          ...comment.likesInfo,
          myStatus: LIKE_STATUS.NONE,
        },
      };
    });
    const userId: string | null = req.userId;

    if (!userId) {
      res
        .status(HTTP_STATUS.OK_200)
        .json({ ...comments, items: defaultItemsResponse });
      return;
    }
    // TODO: refactor
    const itemsResponse = comments.items.map(async (comment) => {
      const like = await this.likesService.getLikeByUserAndCommentId(
        userId,
        comment.id
      );
      return {
        ...comment,
        likesInfo: {
          ...comment.likesInfo,
          myStatus: like ? like.status : LIKE_STATUS.NONE,
        },
      };
    });
    const test = await Promise.all(itemsResponse);

    res.status(HTTP_STATUS.OK_200).json({ ...comments, items: test });
  }

  async getCommentById(
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ): Promise<void> {
    const userId: string | null = req.userId;
    const commentId = req.params.id;

    const comment: TCommentServiceViewModel | null =
      await this.commentsQueryRepository.getCommentById(commentId);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // TODO: refactor
    const defaultResponse = {
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: LIKE_STATUS.NONE,
      },
    };

    if (!userId) {
      res.status(HTTP_STATUS.OK_200).json(defaultResponse);
      return;
    }

    const like = await this.likesService.getLikeByUserAndCommentId(
      userId,
      commentId
    );
    const response = like
      ? {
          ...comment,
          likesInfo: {
            ...comment.likesInfo,
            myStatus: like.status,
          },
        }
      : defaultResponse;

    res.status(HTTP_STATUS.OK_200).json(response);
  }

  async changeLikeStatus(
    req: TRequestWithParamsAndBody<
      TPathParamsCommentsModel,
      TCommentsLikeInputModel
    >,
    res: Response
  ): Promise<void> {
    // Validation if user authorized and if the inputModel has incorrect values happens in the middleware
    // Check if comment exists
    const commentId = req.params.id;
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId
    );
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Check and extract userId in the middlewares
    const userId = req.userId!;
    const likeStatus = req.body.likeStatus;
    await this.likesService.changeLikeStatus({
      userId,
      commentId,
      likeStatus,
      likeType: LIKE_TYPE.COMMENT,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async updateComment(
    req: TRequestWithParamsAndBody<
      TPathParamsCommentsModel,
      TPostCommentControllerInputModel
    >,
    res: Response
  ): Promise<void> {
    // Check that comment exists
    const comment: TCommentServiceViewModel | null =
      await this.commentsQueryRepository.getCommentById(req.params.id);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    // Check that user can modify comment
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    this.commentsService.updateCommentById({
      id: req.params.id,
      content: req.body.content,
    });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async deleteComment(
    req: TRequestWithParams<TPathParamsCommentsModel>,
    res: Response
  ): Promise<void> {
    // Check that comment exists
    const comment: TCommentServiceViewModel | null =
      await this.commentsQueryRepository.getCommentById(req.params.id);
    if (!comment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    // Check that user can delete the comment
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(HTTP_STATUS.FORBIDDEN_403);
      return;
    }

    this.commentsService.deleteCommentById(req.params.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}

export default CommentsController;
