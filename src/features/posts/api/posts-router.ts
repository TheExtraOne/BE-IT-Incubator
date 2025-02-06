import { Router } from "express";
import bodyPostsInputValidator from "../middleware/body-post-input-validation-middleware";
import PostsController from "./posts-controller";
import accessTokenVerificationMiddleware from "../../../adapters/middleware/access-token-verification-middleware";
import optionalAccessTokenVerificationMiddleware from "../../../adapters/middleware/optional-access-token-verification-middleware";
import {
  queryInputValidator,
  inputCheckErrorsMiddleware,
  basicAuthorizationMiddleware,
} from "../../../common/middlewares";
import { container } from "../../../composition-root";
import bodyPostCommentInputValidator from "../../comments/middleware/body-post-comment-input-validation-middleware";
import likeStatusInputValidator from "../../comments/middleware/like-status-input-middleware";

const postsRouter = Router({});
const postsController = container.get<PostsController>("PostsController");

const getAllPostsMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  optionalAccessTokenVerificationMiddleware,
  inputCheckErrorsMiddleware,
];
const getAllCommentsForPostByIdMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  optionalAccessTokenVerificationMiddleware,
  inputCheckErrorsMiddleware,
];
const createPostMiddleware = [
  basicAuthorizationMiddleware,
  bodyPostsInputValidator.titleValidation,
  bodyPostsInputValidator.shortDescriptionValidation,
  bodyPostsInputValidator.contentValidator,
  bodyPostsInputValidator.blogIdValidator,
  inputCheckErrorsMiddleware,
];
const updatePostByIdMiddleware = [
  basicAuthorizationMiddleware,
  bodyPostsInputValidator.titleValidation,
  bodyPostsInputValidator.shortDescriptionValidation,
  bodyPostsInputValidator.contentValidator,
  bodyPostsInputValidator.blogIdValidator,
  inputCheckErrorsMiddleware,
];
const createCommentForPosyById = [
  accessTokenVerificationMiddleware,
  bodyPostCommentInputValidator.contentValidation,
  inputCheckErrorsMiddleware,
];
const likeStatusCommentMiddleware = [
  accessTokenVerificationMiddleware,
  likeStatusInputValidator.likeStatusValidation,
  inputCheckErrorsMiddleware,
];

postsRouter
  .route("/")
  .get(
    [...getAllPostsMiddleware],
    postsController.getPosts.bind(postsController)
  )
  .post(
    [...createPostMiddleware],
    postsController.createPost.bind(postsController)
  );

postsRouter
  .route("/:id/comments")
  .get(
    [...getAllCommentsForPostByIdMiddleware],
    postsController.getAllCommentsForPostById.bind(postsController)
  )
  .post(
    [...createCommentForPosyById],
    postsController.createCommentForPostById.bind(postsController)
  );

postsRouter
  .route("/:id")
  .get(
    optionalAccessTokenVerificationMiddleware,
    postsController.getPostById.bind(postsController)
  )
  .put(
    [...updatePostByIdMiddleware],
    postsController.updatePostById.bind(postsController)
  )
  .delete(
    basicAuthorizationMiddleware,
    postsController.deletePostById.bind(postsController)
  );

postsRouter.put(
  "/:id/like-status",
  [...likeStatusCommentMiddleware],
  postsController.changeLikeStatus.bind(postsController)
);

export default postsRouter;
