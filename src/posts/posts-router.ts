import { Router } from "express";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common-middleware";
import bodyPostsInputValidator from "./middleware/body-post-input-validation-middleware";
import postsController from "./posts-controller";
import authJwtMiddleware from "../jwt/middleware/auth-jwt-middleware";
import bodyPostCommentInputValidator from "./middleware/body-post-comment-input-validation-middleware";

const postsRouter = Router({});

const getAllPostsMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];
const getPostByIdMiddleware = [inputCheckErrorsMiddleware];
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
  authJwtMiddleware,
  bodyPostCommentInputValidator.contentValidation,
  inputCheckErrorsMiddleware,
];

postsRouter.get("/", [...getAllPostsMiddleware], postsController.getPosts);
postsRouter.get("/:id", [...getPostByIdMiddleware], postsController.getPost);
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
