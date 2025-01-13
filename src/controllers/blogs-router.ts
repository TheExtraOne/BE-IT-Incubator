import { Router } from "express";
import {
  authorizationMiddleware,
  blogBodyInputValidator,
  inputCheckErrorsMiddleware,
  postsBodyInputValidator,
  queryInputValidator,
} from "../middleware";
import blogsController from "./blogs-controller";

const blogsRouter = Router({});

const blogBodyInputMiddlewares = [
  authorizationMiddleware,
  ...Object.values(blogBodyInputValidator),
  inputCheckErrorsMiddleware,
];
const postBodyInputMiddlewares = [
  authorizationMiddleware,
  postsBodyInputValidator.contentValidator,
  postsBodyInputValidator.shortDescriptionValidation,
  postsBodyInputValidator.titleValidation,
  inputCheckErrorsMiddleware,
];
const blogQueryInputValidator = [
  ...Object.values(queryInputValidator),
  inputCheckErrorsMiddleware,
];
const postQueryInputValidator = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];

blogsRouter.get("/", [...blogQueryInputValidator], blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlog);
blogsRouter.get(
  "/:id/posts",
  [...postQueryInputValidator],
  blogsController.getAllPostsForBlogById
);
blogsRouter.post(
  "/:id/posts",
  [...postBodyInputMiddlewares],
  blogsController.createPostForBlogId
);
blogsRouter.post(
  "/",
  [...blogBodyInputMiddlewares],
  blogsController.createBlog
);
blogsRouter.put(
  "/:id",
  [...blogBodyInputMiddlewares],
  blogsController.updateBlog
);
blogsRouter.delete("/:id", authorizationMiddleware, blogsController.deleteBlog);

export default blogsRouter;
