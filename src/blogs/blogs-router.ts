import { Router } from "express";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common/middlewares";
import bodyPostsInputValidator from "../posts/middleware/body-post-input-validation-middleware";
import bodyBlogInputValidator from "./middlewares/body-blog-input-validation-middleware";
import { blogController } from "../composition-root";

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

blogsRouter.get(
  "/",
  [...getAllBlogsMiddleWares],
  blogController.getBlogs.bind(blogController)
);
blogsRouter.get("/:id", blogController.getBlogById.bind(blogController));
blogsRouter.get(
  "/:id/posts",
  [...getAllPostsForBlogIdMiddleware],
  blogController.getAllPostsForBlogById.bind(blogController)
);
blogsRouter.post(
  "/:id/posts",
  [...createPostForBlogIdMiddleware],
  blogController.createPostForBlogById.bind(blogController)
);
blogsRouter.post(
  "/",
  [...createBlogMiddleware],
  blogController.createBlog.bind(blogController)
);
blogsRouter.put(
  "/:id",
  [...updateBlogByIdMiddleware],
  blogController.updateBlogById.bind(blogController)
);
blogsRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  blogController.deleteBlogById.bind(blogController)
);

export default blogsRouter;
