import { Router } from "express";
import accessTokenVerificationMiddleware from "../../adapters/middleware/access-token-verification-middleware";
import optionalAccessTokenVerificationMiddleware from "../../adapters/middleware/optional-access-token-verification-middleware";
import bodyPostCommentInputValidator from "../../comments/middleware/body-post-comment-input-validation-middleware";
import {
  queryInputValidator,
  inputCheckErrorsMiddleware,
  basicAuthorizationMiddleware,
} from "../../common/middlewares";
import bodyPostsInputValidator from "../middleware/body-post-input-validation-middleware";
import { postsController } from "../../composition-root";

const postsRouter = Router({});

const getAllPostsMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
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
  .get(postsController.getPostById.bind(postsController))
  .put(
    [...updatePostByIdMiddleware],
    postsController.updatePostById.bind(postsController)
  )
  .delete(
    basicAuthorizationMiddleware,
    postsController.deletePostById.bind(postsController)
  );

export default postsRouter;
