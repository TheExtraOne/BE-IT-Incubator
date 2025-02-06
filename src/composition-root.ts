import PostsService from "./posts/app/posts-service";
import BcryptService from "./adapters/bcrypt-service";
import MailManager from "./managers/mail-manager";
import UsersService from "./users/app/users-service";
import JwtService from "./adapters/jwt-service";
import SecurityService from "./security/app/security-service";
import PostsController from "./posts/api/posts-controller";
import EmailService from "./adapters/email-service";
import RateLimitingService from "./rate-limiting/app/rate-limiting-service";
import LikesService from "./likes/app/likes-service";
import AuthService from "./auth/infrastructure/auth-service";
import AuthController from "./auth/api/auth-controller";
import BlogsController from "./blogs/api/blogs-controller";
import BlogService from "./blogs/app/blogs-service";
import BlogsQueryRepository from "./blogs/infrastructure/blogs-query-repository";
import BlogsRepository from "./blogs/infrastructure/blogs-repository";
import CommentsController from "./comments/api/comments-controller";
import CommentsService from "./comments/app/comments-service";
import CommentsQueryRepository from "./comments/infrastructure/comments-query-repository";
import CommentsRepository from "./comments/infrastructure/comments-repository";
import LikesRepository from "./likes/infrastructure/likes-repository";
import PostsQueryRepository from "./posts/infrastructure/posts-query-repository";
import PostsRepository from "./posts/infrastructure/posts-repository";
import RateLimitingRepository from "./rate-limiting/infrastructure/rate-limiting-repository";
import SecurityController from "./security/api/security-controller";
import SecurityQueryRepository from "./security/infrastructure/security-query-repository";
import SecurityRepository from "./security/infrastructure/security-repository";
import UsersController from "./users/api/users-controller";
import UsersQueryRepository from "./users/infrastructure/users-query-repository";
import UsersRepository from "./users/infrastructure/users-repository";

// Adapters
const emailService = new EmailService();
const mailManager = new MailManager(emailService);
const bcryptService = new BcryptService();
export const jwtService = new JwtService();
// Blogs
const blogRepository = new BlogsRepository();
const blogQueryRepository = new BlogsQueryRepository();
const blogService = new BlogService(blogRepository);
// Post
const postsQueryRepository = new PostsQueryRepository();
const postsRepository = new PostsRepository();
const postsService = new PostsService(blogRepository, postsRepository);
// Users
const usersQueryRepository = new UsersQueryRepository();
const usersRepository = new UsersRepository();
const usersService = new UsersService(bcryptService, usersRepository);
// Comments
const commentsQueryRepository = new CommentsQueryRepository();
const commentRepository = new CommentsRepository();
const commentsService = new CommentsService(commentRepository, usersRepository);
// Rate limiting
const rateLimitingRepository = new RateLimitingRepository();
export const rateLimitingService = new RateLimitingService(
  rateLimitingRepository
);
// Security
const securityQueryRepository = new SecurityQueryRepository();
const securityRepository = new SecurityRepository();
export const securityService = new SecurityService(
  jwtService,
  securityRepository
);
// Auth
const authService = new AuthService(
  bcryptService,
  mailManager,
  usersService,
  usersRepository
);
// Likes
const likesRepository = new LikesRepository();
const likesService = new LikesService(
  likesRepository,
  commentsService,
  postsService,
  usersService
);

// Controllers
export const authController = new AuthController(
  jwtService,
  authService,
  usersService,
  usersQueryRepository,
  securityService
);

export const commentsController = new CommentsController(
  commentsQueryRepository,
  commentsService,
  likesService
);

export const postsController = new PostsController(
  commentsController,
  postsQueryRepository,
  postsService,
  likesService
);

export const blogController = new BlogsController(
  blogService,
  blogQueryRepository,
  postsService,
  postsQueryRepository,
  likesService,
  postsController
);

export const securityController = new SecurityController(
  jwtService,
  securityQueryRepository,
  securityService
);

export const usersController = new UsersController(
  usersQueryRepository,
  usersService
);
