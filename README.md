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
├── auth/                 # Authentication
├── blogs/                # Blog management
├── comments/            # Comments system
├── common/             # Shared utilities
├── db/                # Database config
├── jwt/              # JWT services
├── posts/            # Posts management
├── users/            # User management
└── testing/          # Test utilities
```

## Features

### Core Functionality

- ✅ Complete CRUD operations for blogs, posts, comments, and users
- ✅ JWT authentication with access tokens
- ✅ Email-based registration confirmation
- ✅ Blog-specific post management
- ✅ Comments system with authentication
- ✅ Advanced search and filtering
- ✅ Pagination and sorting capabilities

### Authentication & Security

- ✅ Secure password hashing
- ✅ JWT-based authentication
- ✅ Protected endpoints
- ✅ Basic authorization
- ✅ Email confirmation system

### Testing & Quality

- ✅ Comprehensive E2E tests
- ✅ Isolated test environment with MongoDB Memory Server
- ✅ Coverage reporting
- ✅ TypeScript type safety

## API Features

### Users

- User registration with email confirmation
- Secure authentication
- Profile management
- User search and filtering

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

- [ ] Registration endpoint implementation
- [ ] Email resending functionality
- [ ] Refresh token system
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Enhanced security features
- [ ] Performance optimizations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
