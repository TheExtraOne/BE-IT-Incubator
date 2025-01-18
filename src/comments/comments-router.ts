import { Router } from "express";
import commentsController from "./comments-controller";

const commentsRouter = Router({});

// const getAllPostsMiddleware = [
//   queryInputValidator.pageNumberValidator,
//   queryInputValidator.pageSizeValidator,
//   queryInputValidator.sortByValidator,
//   queryInputValidator.sortDirectionValidator,
//   inputCheckErrorsMiddleware,
// ];
// const getAllCommentsForPostByIdMiddleware = [
//   queryInputValidator.pageNumberValidator,
//   queryInputValidator.pageSizeValidator,
//   queryInputValidator.sortByValidator,
//   queryInputValidator.sortDirectionValidator,
//   inputCheckErrorsMiddleware,
// ];
// const createPostMiddleware = [
//   basicAuthorizationMiddleware,
//   bodyPostsInputValidator.titleValidation,
//   bodyPostsInputValidator.shortDescriptionValidation,
//   bodyPostsInputValidator.contentValidator,
//   bodyPostsInputValidator.blogIdValidator,
//   inputCheckErrorsMiddleware,
// ];
// const updatePostByIdMiddleware = [
//   basicAuthorizationMiddleware,
//   bodyPostsInputValidator.titleValidation,
//   bodyPostsInputValidator.shortDescriptionValidation,
//   bodyPostsInputValidator.contentValidator,
//   bodyPostsInputValidator.blogIdValidator,
//   inputCheckErrorsMiddleware,
// ];
// const createCommentForPosyById = [
//   authJwtMiddleware,
//   bodyPostCommentInputValidator.contentValidation,
//   inputCheckErrorsMiddleware,
// ];

commentsRouter.get("/:id", commentsController.getCommentById);
// postsRouter.put(
//   "/:id",
//   [...updatePostByIdMiddleware],
//   postsController.updatePost
// );
// postsRouter.delete(
//   "/:id",
//   basicAuthorizationMiddleware,
//   postsController.deletePost
// );

export default commentsRouter;
