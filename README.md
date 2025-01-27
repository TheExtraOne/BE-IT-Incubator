# Blogger Platform

A robust REST API platform for blogging with TypeScript and Express.js. Features comprehensive CRUD operations for blogs, posts, comments, and users, along with JWT authentication, email confirmation, and advanced query capabilities.

## Technical Stack

- **Backend Framework**: Node.js/Express.js (v4.21.2)
- **Language**: TypeScript (v5.7.2)
- **Database**: MongoDB (v6.12.0)
- **Validation**: Express-validator (v7.2.1)
- **Authentication**: JWT, bcryptjs
- **Email Service**: Nodemailer (v6.9.16)
- **Utils**: UUID (v11.0.5), date-fns (v4.1.0)
- **Security**: CORS enabled, Password hashing
- **Testing**: Jest (v29.7.0), Supertest (v7.0.0)

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
- Additional email configuration for Nodemailer

## Project Structure

```
src/
├── app.ts                 # Express configuration
├── index.ts              # Entry point
├── adapters/             # External service adapters
│   └── email-adapter.ts  # Email service implementation
├── auth/                 # Authentication
│   ├── auth-controller.ts
│   ├── auth-router.ts
│   ├── auth-service.ts
│   ├── middleware/      # Auth-specific middlewares
│   └── models/         # Auth DTOs and types
├── blogs/               # Blog management
├── comments/           # Comments system
├── common/            # Shared utilities
│   ├── middlewares/  # Common middlewares
│   ├── settings.ts  # Global settings
│   └── types/      # Shared types
├── db/              # Database config
├── jwt/            # JWT services
│   ├── jwt-service.ts
│   └── middleware/ # Token verification
├── managers/      # Business logic managers
├── posts/        # Posts management
├── users/        # User management
└── testing/      # Test utilities

__tests__/
├── e2e/                # End-to-end tests
│   ├── auth/          # Authentication tests
│   ├── blogs/        # Blog-related tests
│   ├── comments/     # Comment-related tests
│   ├── posts/        # Post-related tests
│   ├── users/        # User-related tests
│   └── helpers.ts    # Test utilities
```

## Features

### Core Functionality

- ✅ Complete CRUD operations for blogs, posts, comments, and users
- ✅ JWT authentication with access and refresh tokens
- ✅ Email-based registration confirmation
- ✅ Blog-specific post management
- ✅ Comments system with authentication
- ✅ Advanced search and filtering
- ✅ Pagination and sorting capabilities

### Authentication & Security

- ✅ Secure password hashing
- ✅ JWT-based authentication with:
  - Access tokens for API requests
  - Refresh tokens for token renewal
  - Secure HTTP-only cookies
  - Token blacklisting for logout
- ✅ Protected endpoints
- ✅ Basic authorization
- ✅ Email confirmation system
- ✅ Session management with logout capability

### Testing & Quality

- ✅ Comprehensive E2E tests covering:
  - User authentication flows
  - Token refresh and logout
  - Registration and confirmation
  - CRUD operations
  - Error cases and validation
- ✅ Isolated test environment with MongoDB Memory Server
- ✅ Coverage reporting
- ✅ TypeScript type safety

## API Features

### Authentication

- User registration with email confirmation
- Secure login with JWT tokens
- Token refresh mechanism
- Secure logout with token invalidation
- Session management

### Users

- User registration and authentication
- Profile management
- User search and filtering
- Password security

### Blogs & Posts

- Blog creation and management
- Post creation within blogs
- Advanced search functionality
- Sorting and pagination
- Query parameter validation

### Comments

- Comment creation on posts
- Comment management
- Pagination and sorting
- Authentication-based actions

## Development Scripts

- `yarn watch`: TypeScript compilation (watch mode)
- `yarn dev`: Development server with debugging
- `yarn jest`: Run tests
- `yarn jest:coverage`: Generate test coverage

## Upcoming Features

- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Enhanced security features
- [ ] Performance optimizations
