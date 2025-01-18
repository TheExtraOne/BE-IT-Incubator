# Blogger platform

This repository is a Blogger Platform REST API. The project follows a clean architecture pattern with clear separation of concerns across presentation, business, and data access layers, making it maintainable and scalable. Features: full CRUD operations for blogs, posts, and users, authentication system, pagination with sorting capabilities, blog-specific post management, search functionality, query parameter validation, basic authorization, cross-origin resource sharing.

## Technical Stack

- Node.js/Express.js (v4.21.2) for the web framework
- TypeScript (v5.7.2) for type safety
- MongoDB (v6.12.0) for data persistence
- Express-validator (v7.2.1) for request validation
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

- `middleware`: Authorization, validation, error handling, and input validation for auth, blogs, posts, and users
- `api`: Handle HTTP requests/responses with separate routers and controllers for auth, blogs, posts, and users
- `business-logic`: Services for auth, blogs, posts, and users
- `data-access`: MongoDB data access layer with separate command and query repositories
- `models`: Separate models for different layers (controller, business logic, repository)

Testing (`tests`):

- End-to-end tests using Jest and Supertest
- Separate test suites for blogs, posts, and users CRUD operations
- MongoDB Memory Server for testing
- Coverage reporting capability

## Features

### Authentication

- Secure user registration with password hashing
- Login functionality with basic authorization
- Unique login and email validation

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

## Development Scripts

- `yarn watch`: TypeScript compilation in watch mode
- `yarn dev`: Run development server with debugging
- `yarn jest`: Run tests in isolation
- `yarn jest:coverage`: Generate test coverage reports

## Completed Improvements

- ✅ Auth: Add JWT accessToken on log in
- ✅ Added new endpoint auth/me
- ✅ Added new endpoint: POST comment
- ✅ Added new endpoint: GET comments for postId
- ✅ Added new endpoint: GET comment by Id
- ✅ Added new endpoint: DELETE comment by Id

## TODO

- [ ] Add PUT comment
- [ ] Bearer auth для creating\updating\deleting comments
- [ ] Update tests
- [ ] Update documentation
