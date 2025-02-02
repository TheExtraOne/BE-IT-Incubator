import { Router } from "express";
import commentsController from "./comments-controller";
import accessTokenVerificationMiddleware from "../adapters/middleware/access-token-verification-middleware";
import bodyPostCommentInputValidator from "./middleware/body-post-comment-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";

const commentsRouter = Router({});

const updateCommentMiddleware = [
  accessTokenVerificationMiddleware,
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
  accessTokenVerificationMiddleware,
  commentsController.deleteComment
);

export default commentsRouter;
