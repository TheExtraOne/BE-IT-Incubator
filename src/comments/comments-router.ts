import { Router } from "express";
import commentsController from "./comments-controller";
import authJwtMiddleware from "../jwt/middleware/auth-jwt-middleware";
import bodyPostCommentInputValidator from "./middleware/body-post-comment-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";

const commentsRouter = Router({});

const updateCommentMiddleware = [
  authJwtMiddleware,
  bodyPostCommentInputValidator.contentValidation,
  inputCheckErrorsMiddleware,
];
commentsRouter.get("/:id", commentsController.getCommentById);
commentsRouter.put(
  "/:id",
  [...updateCommentMiddleware],
  commentsController.updateComment
);
commentsRouter.delete(
  "/:id",
  authJwtMiddleware,
  commentsController.deleteComment
);

export default commentsRouter;
