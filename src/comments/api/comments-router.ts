import { Router } from "express";
import accessTokenVerificationMiddleware from "../../adapters/middleware/access-token-verification-middleware";
import bodyPostCommentInputValidator from "../middleware/body-post-comment-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../../common/middlewares";
import { commentsController } from "../../composition-root";
import likeStatusInputValidator from "../middleware/like-status-input-middleware";
import optionalAccessTokenVerificationMiddleware from "../../adapters/middleware/optional-access-token-verification-middleware";

const commentsRouter = Router({});

const updateCommentMiddleware = [
  accessTokenVerificationMiddleware,
  bodyPostCommentInputValidator.contentValidation,
  inputCheckErrorsMiddleware,
];
const likeStatusCommentMiddleware = [
  accessTokenVerificationMiddleware,
  likeStatusInputValidator.likeStatusValidation,
  inputCheckErrorsMiddleware,
];

commentsRouter
  .route("/:id")
  .get(
    optionalAccessTokenVerificationMiddleware,
    commentsController.getCommentById.bind(commentsController)
  )
  .put(
    [...updateCommentMiddleware],
    commentsController.updateComment.bind(commentsController)
  )
  .delete(
    accessTokenVerificationMiddleware,
    commentsController.deleteComment.bind(commentsController)
  );

commentsRouter.put(
  "/:id/like-status",
  [...likeStatusCommentMiddleware],
  commentsController.changeLikeStatus.bind(commentsController)
);

export default commentsRouter;
