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
├── settings.ts           # Application settings
├── auth/                 # Authentication and authorization
│   ├── auth-controller.ts
│   ├── auth-router.ts
│   └── middleware/
├── blogs/                # Blog management
│   ├── blogs-controller.ts
│   ├── blogs-service.ts
│   ├── blogs-repository.ts
│   └── models/
├── comments/            # Comments functionality
│   ├── comments-controller.ts
│   ├── comments-service.ts
│   ├── comments-repository.ts
│   └── models/
├── common-middleware/   # Shared middleware components
├── jwt/                # JWT implementation
├── posts/              # Posts management
│   ├── posts-controller.ts
│   ├── posts-service.ts
│   ├── posts-repository.ts
│   └── models/
├── users/              # User management
│   ├── users-controller.ts
│   ├── users-service.ts
│   ├── users-repository.ts
│   └── models/
└── testing/            # Testing utilities
```

Testing (`__tests__/e2e/`):

- End-to-end tests using Jest and Supertest
- Separate test suites for blogs, posts, comments, and users CRUD operations
- MongoDB Memory Server for testing
- Coverage reporting capability

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

- [ ] Update service response in case of error
- [ ] Add refresh token functionality
- [ ] Implement rate limiting
- [ ] Add API documentation with Swagger/OpenAPI
