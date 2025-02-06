import { Router } from "express";
import bodyPostsInputValidator from "../../posts/middleware/body-post-input-validation-middleware";
import bodyBlogInputValidator from "../middlewares/body-blog-input-validation-middleware";
import BlogsController from "./blogs-controller";
import optionalAccessTokenVerificationMiddleware from "../../../adapters/middleware/optional-access-token-verification-middleware";
import {
  queryInputValidator,
  inputCheckErrorsMiddleware,
  basicAuthorizationMiddleware,
} from "../../../common/middlewares";
import { container } from "../../../composition-root";

const blogsRouter = Router({});
const blogController = container.get<BlogsController>("BlogsController");

const getAllBlogsMiddleWares = [
  ...Object.values(queryInputValidator),
  inputCheckErrorsMiddleware,
];
const getAllPostsForBlogIdMiddleware = [
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  optionalAccessTokenVerificationMiddleware,
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

blogsRouter
  .route("/")
  .get(
    [...getAllBlogsMiddleWares],
    blogController.getBlogs.bind(blogController)
  )
  .post(
    [...createBlogMiddleware],
    blogController.createBlog.bind(blogController)
  );

blogsRouter
  .route("/:id")
  .get(blogController.getBlogById.bind(blogController))
  .put(
    [...updateBlogByIdMiddleware],
    blogController.updateBlogById.bind(blogController)
  )
  .delete(
    basicAuthorizationMiddleware,
    blogController.deleteBlogById.bind(blogController)
  );

blogsRouter
  .route("/:id/posts")
  .get(
    [...getAllPostsForBlogIdMiddleware],
    blogController.getAllPostsForBlogById.bind(blogController)
  )
  .post(
    [...createPostForBlogIdMiddleware],
    blogController.createPostForBlogById.bind(blogController)
  );

export default blogsRouter;
