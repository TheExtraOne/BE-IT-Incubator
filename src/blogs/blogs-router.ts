import { Router } from "express";
import {
  authorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common-middleware";
import blogsController from "./blogs-controller";
import bodyPostsInputValidator from "../posts/middleware/body-post-input-validation-middleware";
import bodyBlogInputValidator from "./middlewares/body-blog-input-validation-middleware";

const blogsRouter = Router({});

const getAllBlogsMiddleWares = [
  ...Object.values(queryInputValidator),
  inputCheckErrorsMiddleware,
];
const getBlogByIdMiddleware = [inputCheckErrorsMiddleware];
const getAllPostsForBlogIdMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];
const createPostForBlogIdMiddleware = [
  authorizationMiddleware,
  bodyPostsInputValidator.contentValidator,
  bodyPostsInputValidator.shortDescriptionValidation,
  bodyPostsInputValidator.titleValidation,
  inputCheckErrorsMiddleware,
];
const createBlogMiddleware = [
  authorizationMiddleware,
  ...Object.values(bodyBlogInputValidator),
  inputCheckErrorsMiddleware,
];
const updateBlogById = [
  authorizationMiddleware,
  ...Object.values(bodyBlogInputValidator),
  inputCheckErrorsMiddleware,
];
const deleteBlogById = [authorizationMiddleware];

blogsRouter.get("/", [...getAllBlogsMiddleWares], blogsController.getBlogs);
blogsRouter.get("/:id", [...getBlogByIdMiddleware], blogsController.getBlog);
blogsRouter.get(
  "/:id/posts",
  [...getAllPostsForBlogIdMiddleware],
  blogsController.getAllPostsForBlogById
);
blogsRouter.post(
  "/:id/posts",
  [...createPostForBlogIdMiddleware],
  blogsController.createPostForBlogId
);
blogsRouter.post("/", [...createBlogMiddleware], blogsController.createBlog);
blogsRouter.put("/:id", [...updateBlogById], blogsController.updateBlog);
blogsRouter.delete("/:id", [...deleteBlogById], blogsController.deleteBlog);

export default blogsRouter;
