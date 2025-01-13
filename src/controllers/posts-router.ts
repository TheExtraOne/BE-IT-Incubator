import { Router } from "express";
import {
  authorizationMiddleware,
  inputCheckErrorsMiddleware,
  postsBodyInputValidator,
  queryInputValidator,
} from "../middleware";
import postsController from "./posts-controller";

const postsRouter = Router({});

const postBodyInputMiddlewares = [
  authorizationMiddleware,
  postsBodyInputValidator.titleValidation,
  postsBodyInputValidator.shortDescriptionValidation,
  postsBodyInputValidator.contentValidator,
  postsBodyInputValidator.blogIdValidator,
  inputCheckErrorsMiddleware,
];
const postQueryInputValidator = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];

postsRouter.get("/", [...postQueryInputValidator], postsController.getPosts);
postsRouter.get("/:id", postsController.getPost);
postsRouter.post(
  "/",
  [...postBodyInputMiddlewares],
  postsController.createPost
);
postsRouter.put(
  "/:id",
  [...postBodyInputMiddlewares],
  postsController.updatePost
);
postsRouter.delete("/:id", authorizationMiddleware, postsController.deletePost);

export default postsRouter;
