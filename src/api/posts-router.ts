import { Router } from "express";
import {
  authorizationMiddleware,
  inputCheckErrorsMiddleware,
  bodyPostsInputValidator,
  queryInputValidator,
} from "../middleware";
import postsController from "./posts-controller";

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
  authorizationMiddleware,
  bodyPostsInputValidator.titleValidation,
  bodyPostsInputValidator.shortDescriptionValidation,
  bodyPostsInputValidator.contentValidator,
  bodyPostsInputValidator.blogIdValidator,
  inputCheckErrorsMiddleware,
];
const updatePostByIdMiddleware = [
  authorizationMiddleware,
  bodyPostsInputValidator.titleValidation,
  bodyPostsInputValidator.shortDescriptionValidation,
  bodyPostsInputValidator.contentValidator,
  bodyPostsInputValidator.blogIdValidator,
  inputCheckErrorsMiddleware,
];
const deletePostByIdMiddleware = [
  authorizationMiddleware,
  inputCheckErrorsMiddleware,
];

postsRouter.get("/", [...getAllPostsMiddleware], postsController.getPosts);
postsRouter.get("/:id", [...getPostByIdMiddleware], postsController.getPost);
postsRouter.post("/", [...createPostMiddleware], postsController.createPost);
postsRouter.put(
  "/:id",
  [...updatePostByIdMiddleware],
  postsController.updatePost
);
postsRouter.delete(
  "/:id",
  [...deletePostByIdMiddleware],
  postsController.deletePost
);

export default postsRouter;
