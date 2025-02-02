import { Router } from "express";
import CommentsController from "./comments-controller";
import accessTokenVerificationMiddleware from "../adapters/middleware/access-token-verification-middleware";
import bodyPostCommentInputValidator from "./middleware/body-post-comment-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";

const commentsRouter = Router({});
const commentsController = new CommentsController();

const updateCommentMiddleware = [
  accessTokenVerificationMiddleware,
  bodyPostCommentInputValidator.contentValidation,
  inputCheckErrorsMiddleware,
];

commentsRouter.get(
  "/:id",
  commentsController.getCommentById.bind(commentsController)
);
commentsRouter.put(
  "/:id",
  [...updateCommentMiddleware],
  commentsController.updateComment.bind(commentsController)
);
commentsRouter.delete(
  "/:id",
  accessTokenVerificationMiddleware,
  commentsController.deleteComment.bind(commentsController)
);

export default commentsRouter;
