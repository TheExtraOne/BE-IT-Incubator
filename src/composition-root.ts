import BcryptService from "./adapters/bcrypt-service";
import MailManager from "./managers/mail-manager";
import JwtService from "./adapters/jwt-service";
import PostsController from "./features/posts/api/posts-controller";
import EmailService from "./adapters/email-service";
import AuthService from "./features/auth/infrastructure/auth-service";
import AuthController from "./features/auth/api/auth-controller";
import BlogsController from "./features/blogs/api/blogs-controller";
import CommentsController from "./features/comments/api/comments-controller";
import CommentsService from "./features/comments/app/comments-service";
import CommentsQueryRepository from "./features/comments/infrastructure/comments-query-repository";
import { Container } from "inversify";
import BlogService from "./features/blogs/app/blogs-service";
import BlogsQueryRepository from "./features/blogs/infrastructure/blogs-query-repository";
import BlogsRepository from "./features/blogs/infrastructure/blogs-repository";
import CommentsRepository from "./features/comments/infrastructure/comments-repository";
import LikesService from "./features/likes/app/likes-service";
import LikesRepository from "./features/likes/infrastructure/likes-repository";
import PostsService from "./features/posts/app/posts-service";
import PostsQueryRepository from "./features/posts/infrastructure/posts-query-repository";
import PostsRepository from "./features/posts/infrastructure/posts-repository";
import RateLimitingService from "./features/rate-limiting/app/rate-limiting-service";
import RateLimitingRepository from "./features/rate-limiting/infrastructure/rate-limiting-repository";
import SecurityController from "./features/security/api/security-controller";
import SecurityService from "./features/security/app/security-service";
import SecurityQueryRepository from "./features/security/infrastructure/security-query-repository";
import SecurityRepository from "./features/security/infrastructure/security-repository";
import UsersController from "./features/users/api/users-controller";
import UsersService from "./features/users/app/users-service";
import UsersQueryRepository from "./features/users/infrastructure/users-query-repository";
import UsersRepository from "./features/users/infrastructure/users-repository";

export const container: Container = new Container();

// Adapters
container.bind<EmailService>("EmailService").to(EmailService);
container.bind<JwtService>("JwtService").to(JwtService);
container.bind<MailManager>("MailManager").to(MailManager);
container.bind<BcryptService>("BcryptService").to(BcryptService);
// Rate limiting
container
  .bind<RateLimitingService>("RateLimitingService")
  .to(RateLimitingService);
container
  .bind<RateLimitingRepository>("RateLimitingRepository")
  .to(RateLimitingRepository);
// Security
container.bind<SecurityController>("SecurityController").to(SecurityController);
container.bind<SecurityService>("SecurityService").to(SecurityService);
container
  .bind<SecurityQueryRepository>("SecurityQueryRepository")
  .to(SecurityQueryRepository);
container.bind<SecurityRepository>("SecurityRepository").to(SecurityRepository);
// Auth
container.bind<AuthController>("AuthController").to(AuthController);
container.bind<AuthService>("AuthService").to(AuthService);
// Likes
container.bind<LikesService>("LikesService").to(LikesService);
container.bind<LikesRepository>("LikesRepository").to(LikesRepository);
// Posts
container.bind<PostsController>("PostsController").to(PostsController);
container.bind<PostsService>("PostsService").to(PostsService);
container
  .bind<PostsQueryRepository>("PostsQueryRepository")
  .to(PostsQueryRepository);
container.bind<PostsRepository>("PostsRepository").to(PostsRepository);
// Comments
container.bind<CommentsController>("CommentsController").to(CommentsController);
container.bind<CommentsService>("CommentsService").to(CommentsService);
container
  .bind<CommentsQueryRepository>("CommentsQueryRepository")
  .to(CommentsQueryRepository);
container.bind<CommentsRepository>("CommentsRepository").to(CommentsRepository);
// Blogs
container.bind<BlogsController>("BlogsController").to(BlogsController);
container.bind<BlogService>("BlogService").to(BlogService);
container
  .bind<BlogsQueryRepository>("BlogsQueryRepository")
  .to(BlogsQueryRepository);
container.bind<BlogsRepository>("BlogsRepository").to(BlogsRepository);
// User
container.bind<UsersController>("UsersController").to(UsersController);
container.bind<UsersService>("UsersService").to(UsersService);
container
  .bind<UsersQueryRepository>("UsersQueryRepository")
  .to(UsersQueryRepository);
container.bind<UsersRepository>("UsersRepository").to(UsersRepository);
