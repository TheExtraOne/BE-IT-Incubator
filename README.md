# Blogger platform

This repository is a Blogger Platform REST API. The project follows a clean architecture pattern with clear separation of concerns across presentation, business, and data access layers, making it maintainable and scalable. Features: full CRUD operations for blogs, posts, comments, and users, JWT authentication system, pagination with sorting capabilities, blog-specific post management, search functionality, query parameter validation, basic authorization, cross-origin resource sharing.

## Technical Stack

- Node.js/Express.js (v4.21.2) for the web framework
- TypeScript (v5.7.2) for type safety
- MongoDB (v6.12.0) for data persistence
- Express-validator (v7.2.1) for request validation
- JWT for secure authentication
- CORS enabled for cross-origin requests
- Environment configuration using dotenv
- Password hashing for secure authentication

## Development Setup

- Watch mode with TypeScript compiler
- Nodemon for development with debugging
- Jest for isolated test running
- Comprehensive type definitions for all dependencies

## Environment variables

- **PORT**: The port for the API gateway (3000)
- **MONGO_URL**: Connection string to MongoDb
- **LOGIN_PASSWORD**: Credentials for authorization

## Project Structure

The `src` directory contains the core components of our application:

```
src/
├── app.ts                 # Express app configuration
├── index.ts              # Application entry point
├── auth/                 # Authentication and authorization
│   ├── auth-controller.ts
│   ├── auth-router.ts
│   ├── middleware/
│   └── models/
├── blogs/                # Blog management
│   ├── blogs-controller.ts
│   ├── blogs-service.ts
│   ├── blogs-repository.ts
│   ├── blogs-query-repository.ts
│   ├── blogs-router.ts
│   ├── middlewares/
│   └── models/
├── comments/            # Comments functionality
│   ├── comments-controller.ts
│   ├── comments-service.ts
│   ├── comments-repository.ts
│   ├── comments-query-repository.ts
│   ├── comments-router.ts
│   ├── middleware/
│   └── models/
├── common/             # Shared components
│   ├── settings.ts
│   ├── middlewares/
│   └── types/
├── db/                # Database configuration
│   └── db.ts
├── jwt/              # JWT implementation
│   ├── jwt-service.ts
│   └── middleware/
├── posts/            # Posts management
│   ├── posts-controller.ts
│   ├── posts-service.ts
│   ├── posts-repository.ts
│   ├── posts-query-repository.ts
│   ├── posts-router.ts
│   ├── middleware/
│   └── models/
├── users/            # User management
│   ├── users-controller.ts
│   ├── users-service.ts
│   ├── users-repository.ts
│   ├── users-query-repository.ts
│   ├── users-router.ts
│   ├── middleware/
│   └── models/
└── testing/          # Testing utilities
    ├── testing-repository.ts
    └── testing-router.ts
```

Testing (`__tests__/e2e/`):

- Comprehensive end-to-end tests using Jest (v29.7.0) and Supertest (v7.0.0)
- Organized test suites by feature:
  - Auth: Login and registration flows
  - Blogs: CRUD operations and blog-specific posts
  - Posts: CRUD operations and post comments
  - Comments: Creation, updates, and deletion
  - Users: Account management and queries
- MongoDB Memory Server (v10.1.3) for isolated testing
- Coverage reporting with jest:coverage command
- Helper utilities for test setup and teardown

## Features

### Authentication

- Secure user registration with password hashing
- JWT-based authentication with access tokens
- Basic authorization support
- Protected endpoints with Bearer authentication
- /auth/me endpoint for current user information

### Users Management

- Complete CRUD operations
- Pagination support
- Sorting capabilities
- Unique login/email validation

### Blogs & Posts

- Full CRUD operations
- Blog-specific post management
- Search functionality
- Pagination and sorting
- Query parameter validation
- Comments support for posts

### Comments System

- Create comments on posts with Bearer authentication
- Retrieve comments for specific posts
- Update and delete comments with authentication
- Comment pagination and sorting
- Query parameter validation

## Development Scripts

- `yarn watch`: TypeScript compilation in watch mode
- `yarn dev`: Run development server with debugging
- `yarn jest`: Run tests in isolation
- `yarn jest:coverage`: Generate test coverage reports

## Completed Features

- ✅ JWT authentication with accessToken on login
- ✅ Protected /auth/me endpoint
- ✅ Comments system implementation:
  - ✅ POST comment with Bearer auth
  - ✅ GET comments for postId
  - ✅ GET comment by Id
  - ✅ DELETE comment by Id with Bearer auth
  - ✅ PUT comment by Id with Bearer auth
- ✅ Updated e2e tests for all new endpoints
- ✅ Query repositories implementation
- ✅ Separation of command and query repositories

## TODO

- [ ] Add refresh token functionality
- [ ] Implement rate limiting
- [ ] Add API documentation with Swagger/OpenAPI
