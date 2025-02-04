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

postsRouter.get(
  "/",
  [...getAllPostsMiddleware],
  postsController.getPosts.bind(postsController)
);
postsRouter.get("/:id", postsController.getPostById.bind(postsController));
postsRouter.get(
  "/:id/comments",
  [...getAllCommentsForPostByIdMiddleware],
  postsController.getAllCommentsForPostById.bind(postsController)
);
postsRouter.post(
  "/:id/comments",
  [...createCommentForPosyById],
  postsController.createCommentForPostById.bind(postsController)
);
postsRouter.post(
  "/",
  [...createPostMiddleware],
  postsController.createPost.bind(postsController)
);
postsRouter.put(
  "/:id",
  [...updatePostByIdMiddleware],
  postsController.updatePostById.bind(postsController)
);
postsRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  postsController.deletePostById.bind(postsController)
);

export default postsRouter;
