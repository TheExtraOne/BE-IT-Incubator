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
import { Container } from "inversify";

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
