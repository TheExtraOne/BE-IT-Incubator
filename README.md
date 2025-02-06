# Blogger Platform

A robust REST API platform for blogging with TypeScript and Express.js. Features comprehensive CRUD operations for blogs, posts, comments, and users, along with JWT authentication, email confirmation, and advanced query capabilities.

## Technical Stack

- **Backend Framework**: Node.js/Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Express-validator
- **Authentication**: JWT, bcrypt
- **Email Service**: Nodemailer
- **Testing**: Jest, Supertest
- **Dependency Injection**: InversifyJS
- **Architecture**:
  - Clean Architecture principles with distinct layers (API, Application, Infrastructure, Domain)
  - Object-Oriented Programming with TypeScript classes
  - Dependency Injection using InversifyJS for better testability and maintainability
  - Composition Root pattern for centralized dependency management
  - Decorators for automatic dependency injection

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables (see Environment Variables section)
4. Run development server:
   ```bash
   yarn watch
   yarn dev
   ```

## Environment Variables

Create a `.env` file in the root directory with:

- `PORT`: API gateway port (default: 3000)
- `MONGO_URL`: MongoDB connection string
- `LOGIN_PASSWORD`: Authorization credentials
- `JWT_SECRET` and `JWT_EXPIRY`: Ordinary JWT settings
- `AC_SECRET` and `AC_EXPIRY`: Ordinary access token settings
- `RT_SECRET` and `RT_EXPIRY`: Ordinary refresh token settings
- `MAIL_RU_PASS`: Password for using nodemailer
- `RATE_LIMIT_WINDOW`: Time window for rate limiting in seconds (default: 10)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per time window (default: 5)

## Project Structure

```
src/
├── adapters/            # External service adapters (JWT, Email, etc.)
├── app.ts              # Express configuration
├── composition-root.ts  # Dependency injection container setup
├── common/             # Shared utilities and types
└── [feature]/          # Feature modules (auth, blogs, posts, etc.)
    ├── api/            # Controllers and routes with @injectable decorators
    ├── app/            # Application services with @injectable decorators
    ├── domain/         # Domain models and schemas
    └── infrastructure/ # Repositories with @injectable decorators
```

## Features

### Authentication & Authorization

- JWT-based authentication with access and refresh tokens
- Basic authentication for admin endpoints
- Email confirmation for registration
- Password recovery flow
- Rate limiting with automatic cleanup (TTL-based)
- Device session management

### Content Management

- Blogs CRUD with moderation
- Posts CRUD with blog association
- Comments with nested replies
- Like/Dislike system for posts and comments

### Security

- Rate limiting protection to prevent brute-force attacks
- Session management across devices
- Secure password hashing
- CORS protection

### Data Management

- Pagination and filtering for all list endpoints
- Efficient MongoDB indexes
- Automatic cleanup of expired rate limit records
- Input validation and sanitization

## API Documentation

### Auth Endpoints

- POST /auth/login - User authentication
- POST /auth/refresh-token - Token refresh
- POST /auth/registration - New user registration
- POST /auth/registration-confirmation - Email confirmation
- POST /auth/registration-email-resending - Resend confirmation email
- POST /auth/logout - User logout
- POST /auth/password-recovery - Initiate password recovery
- POST /auth/new-password - Set new password

### Blog Endpoints

- GET /blogs - List all blogs
- POST /blogs - Create new blog (admin only)
- GET /blogs/:id - Get blog details
- PUT /blogs/:id - Update blog (admin only)
- DELETE /blogs/:id - Delete blog (admin only)
- GET /blogs/:blogId/posts - List blog posts

### Post Endpoints

- GET /posts - List all posts
- POST /posts - Create new post (admin only)
- GET /posts/:id - Get post details
- PUT /posts/:id - Update post (admin only)
- DELETE /posts/:id - Delete post (admin only)
- POST /posts/:postId/comments - Add comment to post
- GET /posts/:postId/comments - Get post comments
- PUT /posts/:postId/like-status - Update post like status (auth required)

### Comment Endpoints

- PUT /comments/:commentId/like-status - Update comment like status (auth required)
- GET /comments/:id - Get comment by id
- DELETE /comments/:id - Delete comment
- PUT /comments/:id - Update comment

### Like Status Operations

The like-status endpoints accept the following status values:

- "Like" - Add like
- "Dislike" - Add dislike
- "None" - Remove like/dislike

Response includes:

- likesCount - Total number of likes
- dislikesCount - Total number of dislikes
- myStatus - Current user's like status
- newestLikes - Array of latest likes with user details

### User Management

- GET /users - List all users (admin only)
- POST /users - Create user (admin only)
- DELETE /users/:id - Delete user (admin only)

### Security Endpoints

- GET /security/devices - List all active sessions
- DELETE /security/devices/:deviceId - Terminate specific session
- DELETE /security/devices - Terminate all other sessions

## Testing

Run tests with:

```bash
yarn test
```

For e2e tests:

```bash
yarn test:e2e
```
