# Blogger Platform

A robust REST API platform for blogging with TypeScript and Express.js. Features comprehensive CRUD operations for blogs, posts, comments, and users, along with JWT authentication, email confirmation, and advanced query capabilities.

## Technical Stack

- **Backend Framework**: Node.js/Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Validation**: Express-validator
- **Authentication**: JWT, bcrypt
- **Email Service**: Nodemailer
- **Testing**: Jest, Supertest

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
├── app.ts                # Express configuration
├── index.ts             # Entry point
├── adapters/            # External service adapters
│   ├── bcypt-service.ts # Password encryption
│   ├── email-service.ts # Email service
│   ├── jwt-service.ts   # JWT operations
│   └── middleware/      # Token verification middleware
├── auth/                # Authentication
├── blogs/              # Blog management
├── comments/           # Comments system
├── common/             # Shared utilities
│   ├── middlewares/    # Common middlewares
│   ├── settings.ts     # Global settings
│   └── types/          # Shared types
├── db/                 # Database configuration
├── managers/           # Business logic managers
├── posts/              # Posts management
├── rate-limiting/      # Rate limiting functionality
├── security/           # Security & session management
├── testing/            # Testing utilities
└── users/              # User management

__tests__/
├── e2e/                # End-to-end tests
│   ├── auth/          # Authentication tests
│   ├── blogs/         # Blog-related tests
│   ├── comments/      # Comment-related tests
│   ├── posts/         # Post-related tests
│   ├── sessions/      # Device session tests
│   ├── users/         # User-related tests
│   └── helpers.ts     # Test utilities
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
- ✅ Sophisticated rate limiting system

### Authentication & Security

- ✅ Secure password hashing with bcrypt
- ✅ JWT-based authentication with:
  - Access tokens for API requests
  - Refresh tokens for token renewal
  - Secure HTTP-only cookies
  - Token blacklisting for logout
- ✅ Protected endpoints with basic authorization
- ✅ Email confirmation system
- ✅ Password recovery system:
  - Password recovery request
  - Secure recovery code handling
  - New password validation
  - Old password invalidation
- ✅ Advanced session management:
  - Multi-device login support
  - Device-specific session tracking
  - Active sessions monitoring
  - Individual session termination
  - Bulk session management
  - Last active date tracking
  - Device identification

### Security Features

- ✅ Device session management:
  - List all active sessions
  - Terminate specific device sessions
  - Terminate all sessions except current
  - Auto session cleanup on logout
- ✅ Session security measures:
  - Device fingerprinting
  - Last active tracking
  - Unauthorized access prevention
  - Cross-device session validation
- ✅ Security endpoints:
  - GET /security/devices - List all active sessions
  - DELETE /security/devices/:deviceId - Terminate specific session
  - DELETE /security/devices - Terminate all other sessions
- ✅ Rate limiting protection:
  - Configurable time windows
  - IP-based tracking
  - MongoDB persistence
  - Per-endpoint limits

### Testing & Quality

- ✅ Comprehensive E2E tests covering:
  - Authentication flows:
    - Login and logout
    - Registration with email confirmation
    - Password recovery and reset
    - Token refresh
    - Registration email resend
  - CRUD operations
  - Error cases and validation
  - Rate limiting
- ✅ Isolated test environment with MongoDB Memory Server
- ✅ TypeScript type safety
- ✅ Input validation middleware
- ✅ Error handling middleware

## API Features

### Security & Sessions

- Complete device session management
- Multi-device authentication tracking
- Session monitoring and control
- Device-specific security measures

### Authentication

- User registration with email confirmation
- Login with JWT token generation
- Token refresh mechanism
- Secure logout
- Registration email resend capability
- Password recovery and reset functionality

### Users

- User creation and management
- Profile retrieval and updates
- User search and filtering
- Secure password handling

### Blogs & Posts

- Blog creation and management
- Post creation within blogs
- Advanced search and filtering
- Sorting and pagination
- Query parameter validation

### Comments

- Comment creation on posts
- Comment management (update, delete)
- Pagination and sorting
- Authentication-based actions

### Rate Limiting

- ✅ Advanced request rate limiting system
- ✅ Configurable time windows and request limits
- ✅ IP-based rate limiting with MongoDB persistence
- ✅ Per-endpoint rate limit configuration
- ✅ Automatic request tracking and limiting
- ✅ Protection against DDoS and brute-force attacks

## Development Scripts

- `yarn watch`: TypeScript compilation in watch mode
- `yarn dev`: Run development server
- `yarn test`: Run tests
- `yarn jest:coverage`: Generate test coverage

## Upcoming Features

- 🔄 API documentation (Swagger/OpenAPI)
- 🔄 Performance optimizations
