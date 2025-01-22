import { Router } from "express";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common/middlewares";
import bodyPostsInputValidator from "./middleware/body-post-input-validation-middleware";
import postsController from "./posts-controller";
import accessTokenVerificationMiddleware from "../jwt/middleware/access-token-verification-middleware";
import bodyPostCommentInputValidator from "../comments/middleware/body-post-comment-input-validation-middleware";

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

postsRouter.get("/", [...getAllPostsMiddleware], postsController.getPosts);
postsRouter.get("/:id", postsController.getPost);
postsRouter.get(
  "/:id/comments",
  [...getAllCommentsForPostByIdMiddleware],
  postsController.getAllCommentsForPostById
);
postsRouter.post(
  "/:id/comments",
  [...createCommentForPosyById],
  postsController.createCommentForPostById
);
postsRouter.post("/", [...createPostMiddleware], postsController.createPost);
postsRouter.put(
  "/:id",
  [...updatePostByIdMiddleware],
  postsController.updatePost
);
postsRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  postsController.deletePost
);

export default postsRouter;
