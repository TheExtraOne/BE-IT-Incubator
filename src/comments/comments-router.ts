import { Router } from "express";
import commentsController from "./comments-controller";
import authJwtMiddleware from "../jwt/middleware/auth-jwt-middleware";

const commentsRouter = Router({});

commentsRouter.get("/:id", commentsController.getCommentById);
// postsRouter.put(
//   "/:id",
//   [...updatePostByIdMiddleware],
//   postsController.updatePost
// );
commentsRouter.delete(
  "/:id",
  authJwtMiddleware,
  commentsController.deleteComment
);

export default commentsRouter;
