import BlogsController from "./blogs/blogs-controller";
import BlogsRepository from "./blogs/blogs-repository";
import BlogService from "./blogs/blogs-service";
import BlogsQueryRepository from "./blogs/blogs-query-repository";
import PostsService from "./posts/posts-service";
import PostsQueryRepository from "./posts/posts-query-repository";
import AuthService from "./auth/auth-service";
import BcryptService from "./adapters/bcrypt-service";
import MailManager from "./managers/mail-manager";
import UsersService from "./users/users-service";
import UsersRepository from "./users/users-repository";
import AuthController from "./auth/auth-controller";
import JwtService from "./adapters/jwt-service";
import UsersQueryRepository from "./users/users-query-repository";
import SecurityService from "./security/security-service";
import CommentsService from "./comments/comments-service";
import CommentsRepository from "./comments/comments-repository";
import CommentsController from "./comments/comments-controller";
import CommentsQueryRepository from "./comments/comments-query-repository";
import PostsRepository from "./posts/posts-repository";
import PostsController from "./posts/posts-controller";
import EmailService from "./adapters/email-service";
import RateLimitingRepository from "./rate-limiting/rate-limiting-repository";
import RateLimitingService from "./rate-limiting/rate-limiting-service";
import SecurityQueryRepository from "./security/security-query-repository";
import SecurityRepository from "./security/security-repository";
import SecurityController from "./security/security-controller";
import UsersController from "./users/users-controller";

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

// Controllers
export const blogController = new BlogsController(
  blogService,
  blogQueryRepository,
  postsService,
  postsQueryRepository
);

export const authController = new AuthController(
  jwtService,
  authService,
  usersService,
  usersQueryRepository,
  securityService
);

export const commentsController = new CommentsController(
  commentsQueryRepository,
  commentsService
);

export const postsController = new PostsController(
  commentsController,
  postsQueryRepository,
  postsService
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
