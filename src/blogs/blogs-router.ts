import { Router } from "express";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common/middlewares";
import blogsController from "./blogs-controller";
import bodyPostsInputValidator from "../posts/middleware/body-post-input-validation-middleware";
import bodyBlogInputValidator from "./middlewares/body-blog-input-validation-middleware";

const blogsRouter = Router({});

const getAllBlogsMiddleWares = [
  ...Object.values(queryInputValidator),
  inputCheckErrorsMiddleware,
];
const getAllPostsForBlogIdMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];
const createPostForBlogIdMiddleware = [
  basicAuthorizationMiddleware,
  bodyPostsInputValidator.contentValidator,
  bodyPostsInputValidator.shortDescriptionValidation,
  bodyPostsInputValidator.titleValidation,
  inputCheckErrorsMiddleware,
];
const createBlogMiddleware = [
  basicAuthorizationMiddleware,
  ...Object.values(bodyBlogInputValidator),
  inputCheckErrorsMiddleware,
];
const updateBlogByIdMiddleware = [
  basicAuthorizationMiddleware,
  ...Object.values(bodyBlogInputValidator),
  inputCheckErrorsMiddleware,
];

blogsRouter.get("/", [...getAllBlogsMiddleWares], blogsController.getBlogs);
blogsRouter.get("/:id", blogsController.getBlogById);
blogsRouter.get(
  "/:id/posts",
  [...getAllPostsForBlogIdMiddleware],
  blogsController.getAllPostsForBlogById
);
blogsRouter.post(
  "/:id/posts",
  [...createPostForBlogIdMiddleware],
  blogsController.createPostForBlogById
);
blogsRouter.post("/", [...createBlogMiddleware], blogsController.createBlog);
blogsRouter.put(
  "/:id",
  [...updateBlogByIdMiddleware],
  blogsController.updateBlogById
);
blogsRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  blogsController.deleteBlogById
);

export default blogsRouter;
