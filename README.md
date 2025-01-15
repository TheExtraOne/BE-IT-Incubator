# Blogger platform

This repository is a Blogger Platform REST API. The project follows a clean architecture pattern with clear separation of concerns across presentation, business, and data access layers, making it maintainable and scalable. Features: full CRUD operations for blogs and posts, pagination with sorting capabilities, blog-specific post management, search functionality for blogs, query parameter validation, basic authorization, cross-origin resource sharing.

## Technical Stack

- Node.js/Express.js (v4.21.2) for the web framework
- TypeScript (v5.7.2) for type safety
- MongoDB (v6.12.0) for data persistence
- Express-validator (v7.2.1) for request validation
- CORS enabled for cross-origin requests
- Environment configuration using dotenv

## Development Setup

- Watch mode with TypeScript compiler
- Nodemon for development with debugging
- Jest for isolated test running
- Comprehensive type definitions for all dependencies

## Environment variables

- **PORT**: The port for the API gateway (3000).
- **MONGO_URL**: Connection string to MongoDb.
- **LOGIN_PASSWORD**: Credentials for authorization.

## Project Structure

The `src` directory contains the core components of our application:

- `middleware`: Authorization, validation, and error handling.
- `api`: Handle HTTP requests/responses with separate routers and controllers for blogs and posts.
- `business-logic`: Services for blogs and posts.
- `data-access`: MongoDB data access layer (command and query repository).
- `models`: Separate models for different layers (controller, bll, repository).

Testing (`tests`):

- End-to-end tests using Jest and Supertest
- Separate test suites for blogs and posts CRUD operations
- MongoDB Memory Server for testing
- Coverage reporting capability

## Development Scripts

- `yarn watch`: TypeScript compilation in watch mode
- `yarn dev`: Run development server with debugging
- `yarn jest`: Run tests in isolation
- `yarn jest:coverage`: Generate test coverage reports

## TODO

- [+] Remove old generated ids with if of the mongo db
- [+] Refactor DAL: add query repository
- [+] CRUD for user: get All
- [+] CRUD for user: create
- [+] CRUD for user: delete
- [+] Add Pagination for users
- [+] Add Sorting for users
- [+] Add check for unique login and email
- [ ] Log in
- [ ] Update tests
