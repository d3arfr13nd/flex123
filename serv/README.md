<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS application with Authentication and User Management modules.

## Features

- **AuthModule**: JWT-based authentication with access and refresh tokens
  - User registration and login
  - Token refresh with rotation
  - Token versioning for security
  - Password reset functionality
  - User profile management

- **UsersModule**: User management with role-based access control
  - CRUD operations for users (Admin only)
  - Self-service user profile management
  - Password change functionality
  - Pagination and filtering

## Database Setup

1. Create a PostgreSQL database
2. Configure database connection in `.env` file
3. TypeORM will automatically create/update the database schema on startup (in development mode)

**Note**: In production, set `NODE_ENV=production` to disable automatic schema synchronization. Use migrations instead.

## Environment Variables

Create a `.env` file in the `serv` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flexspace
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for password reset notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
APP_NAME=FlexSpace
FRONTEND_URL=http://localhost:3000
```

**Note**: TypeORM uses `synchronize: true` in development mode (when `NODE_ENV !== 'production'`). This automatically creates/updates database schema. In production, use migrations instead.

## API Endpoints

### Auth Endpoints

- `POST /api/auth/register` (public) - Register a new user
- `POST /api/auth/login` (public) - Login user
- `POST /api/auth/refresh` (user) - Refresh access token
- `POST /api/auth/logout` (user) - Logout user
- `POST /api/auth/forgot` (public) - Request password reset
- `POST /api/auth/reset` (public) - Reset password with token
- `GET /api/auth/profile` (user) - Get current user profile

### Users Endpoints

- `GET /api/users` (admin) - Get all users with pagination and filters
- `GET /api/users/:id` (admin) - Get user by ID
- `PATCH /api/users/:id` (admin) - Update user
- `DELETE /api/users/:id` (admin) - Delete user
- `GET /api/users/me` (user) - Get current user profile
- `PATCH /api/users/me` (user) - Update current user profile
- `PATCH /api/users/me/password` (user) - Change current user password

### Rooms Endpoints

- `GET /api/rooms` (public) - Get all rooms with filters
- `GET /api/rooms/:id` (public) - Get room by ID
- `GET /api/rooms/availability/:id` (public) - Get room availability for a specific date
- `POST /api/rooms` (admin) - Create a new room
- `PUT /api/rooms/:id` (admin) - Update room
- `DELETE /api/rooms/:id` (admin) - Delete room
- `POST /api/rooms/upload?roomId=:id` (admin) - Upload photos for a room

### Bookings Endpoints

- `POST /api/bookings` (user) - Create a new booking
- `GET /api/bookings` (admin) - Get all bookings with pagination and filters
- `GET /api/bookings/user` (user) - Get current user's bookings
- `GET /api/bookings/:id` (user/admin) - Get booking by ID
- `PUT /api/bookings/:id/cancel` (user/admin) - Cancel a booking
- `PUT /api/bookings/:id/status` (admin) - Update booking status

## Architecture Overview

### Controllers

#### AuthController (`src/auth/auth.controller.ts`)
Handles authentication and authorization endpoints.

**Methods:**
- `register(registerDto: RegisterDto)` - Register a new user account
- `login(loginDto: LoginDto)` - Authenticate user and return JWT tokens
- `refresh()` - Refresh access token using refresh token (requires JwtRefreshGuard)
- `logout()` - Invalidate user tokens (requires JwtAuthGuard)
- `forgotPassword(forgotPasswordDto: ForgotPasswordDto)` - Request password reset link
- `resetPassword(resetPasswordDto: ResetPasswordDto)` - Reset password with token
- `getProfile()` - Get current authenticated user profile (requires JwtAuthGuard)

#### UsersController (`src/users/users.controller.ts`)
Manages user CRUD operations with role-based access control.

**Methods:**
- `create(createUserDto: CreateUserDto)` - Create new user (Admin only)
- `findAll(page, limit, role?, search?)` - Get paginated list of users with filters (Admin only)
- `findOne(id: number)` - Get user by ID (Admin only)
- `update(id: number, updateUserDto: UpdateUserDto)` - Update user (Admin only)
- `remove(id: number)` - Delete user (Admin only)
- `getMe()` - Get current user profile (authenticated users)
- `updateMe(updateUserDto: UpdateUserDto)` - Update current user profile (authenticated users)
- `updateMyPassword(updatePasswordDto: UpdatePasswordDto)` - Change current user password (authenticated users)

#### RoomsController (`src/rooms/rooms.controller.ts`)
Manages room/space management with public read access and admin write access.

**Methods:**
- `findAll(filters: FilterRoomsDto)` - Get all rooms with optional filters (public)
- `findOne(id: number)` - Get room by ID (public)
- `getAvailability(id: number, date: string)` - Get room availability time slots for a date (public)
- `create(createRoomDto: CreateRoomDto)` - Create new room (Admin only)
- `update(id: number, updateRoomDto: UpdateRoomDto)` - Update room (Admin only)
- `remove(id: number)` - Delete room (Admin only)
- `uploadFiles(files, roomId)` - Upload photos for a room (Admin only, max 10 files, 5MB each)

#### BookingsController (`src/bookings/bookings.controller.ts`)
Handles booking creation and management with user/admin access control.

**Methods:**
- `create(createBookingDto: CreateBookingDto, idempotencyKey?)` - Create new booking (authenticated users)
- `findAll(page, limit, status?, dateStart?, dateEnd?)` - Get all bookings with pagination and filters (Admin only)
- `findByUser()` - Get current user's bookings (authenticated users)
- `findOne(id: number)` - Get booking by ID (users can only see their own, admins can see all)
- `cancel(id: number)` - Cancel a booking (users can cancel their own, admins can cancel any)
- `updateStatus(id: number, updateStatusDto: UpdateBookingStatusDto)` - Update booking status (Admin only)

### Services

#### AuthService (`src/auth/auth.service.ts`)
Core authentication logic and token management.

**Methods:**
- `register(registerDto: RegisterDto)` - Create new user account and generate tokens
- `login(loginDto: LoginDto)` - Authenticate user credentials and generate tokens
- `refresh(userId: number, oldTokenVersion: number)` - Generate new tokens with token rotation
- `logout(userId: number)` - Invalidate all user tokens by incrementing token version
- `forgotPassword(forgotPasswordDto: ForgotPasswordDto)` - Generate and send password reset token
- `resetPassword(resetPasswordDto: ResetPasswordDto)` - Reset user password with token
- `getProfile(userId: number)` - Get user profile information
- `generateTokens(userId: number, role: string, tokenVersion: number)` - Private method to generate JWT tokens

#### UsersService (`src/users/users.service.ts`)
User management and data access operations.

**Methods:**
- `create(createUserDto: CreateUserDto)` - Create new user with password hashing
- `findAll(page: number, limit: number, filters?)` - Get paginated users with role and search filters
- `findOne(id: number)` - Get user by ID (excludes password hash)
- `findByEmail(email: string)` - Find user by email address
- `update(id: number, updateUserDto: UpdateUserDto)` - Update user information
- `updatePassword(id: number, updatePasswordDto: UpdatePasswordDto)` - Change user password with validation
- `incrementTokenVersion(id: number)` - Increment token version to invalidate tokens
- `resetPasswordById(id: number, newPasswordHash: string)` - Reset password by ID (used in password reset flow)
- `remove(id: number)` - Delete user from database

#### RoomsService (`src/rooms/rooms.service.ts`)
Room/space management and availability checking.

**Methods:**
- `create(createRoomDto: CreateRoomDto)` - Create new room with slug uniqueness check
- `findAll(filters?: FilterRoomsDto)` - Get rooms with advanced filtering:
  - Filter by type (desk, vip, meeting, conference)
  - Filter by capacity (min/max)
  - Filter by price (min/max)
  - Search by name, description, or slug
  - Only returns active rooms for public endpoints
- `findOne(id: number)` - Get room by ID
- `findBySlug(slug: string)` - Find room by unique slug
- `update(id: number, updateRoomDto: UpdateRoomDto)` - Update room with slug conflict checking
- `remove(id: number)` - Delete room
- `getAvailability(id: number, date: string)` - Get hourly time slots (9 AM - 6 PM) for a specific date
- `addPhotos(id: number, photoUrls: string[])` - Add photo URLs to room's photo array

#### BookingsService (`src/bookings/bookings.service.ts`)
Booking management with conflict detection and access control.

**Methods:**
- `create(userId: number, createBookingDto: CreateBookingDto, idempotencyKey?)` - Create booking with:
  - Idempotency key support to prevent duplicate bookings
  - Date validation (end > start, start not in past)
  - Overlapping booking detection
  - Automatic price calculation based on room rate and duration
- `findAll(page: number, limit: number, filters?)` - Get paginated bookings with:
  - Status filter (pending, paid, cancelled, done)
  - Date range filters (dateStart, dateEnd)
  - Includes room and user relations
- `findByUser(userId: number)` - Get all bookings for a specific user
- `findOne(id: number, userId?: number, isAdmin?: boolean)` - Get booking with access control
- `cancel(id: number, userId: number, isAdmin: boolean)` - Cancel booking with:
  - Access control (users can only cancel their own)
  - Status validation (cannot cancel already cancelled or done bookings)
- `updateStatus(id: number, updateStatusDto: UpdateBookingStatusDto)` - Update booking status (Admin only)
  - Validates status transitions (e.g., cannot cancel completed bookings)

#### EmailService (`src/auth/email.service.ts`)
Email sending functionality for password reset and notifications.

**Methods:**
- `sendPasswordResetLink(email: string, userName: string, resetToken: string)` - Send password reset email with:
  - HTML and plain text versions
  - Reset link and token
  - Expiration warning
- `sendPasswordResetConfirmation(email: string, userName: string)` - Send confirmation email after successful password reset

## Security Features

- Password hashing with bcrypt
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 days expiry)
- Token versioning for invalidation
- Refresh token rotation
- Role-based access control (User/Admin)
- Input validation with class-validator
- Email format validation
- Minimum password length (8 characters)
- Idempotency key support for booking creation
- Overlapping booking detection

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
