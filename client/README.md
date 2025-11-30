# FlexSpace Client

Modern React frontend for the FlexSpace coworking web application.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **Zustand** - State management (auth, UI state)
- **TanStack Query v5** - Server state management
- **Ant Design v5** - UI component library
- **Axios** - HTTP client
- **Vite** - Build tool

## Project Structure

```
src/
  api/              # API clients (axios, authApi, usersApi, roomsApi, bookingsApi)
  store/            # Zustand stores (authStore, uiStore)
  hooks/            # Custom hooks (useAuth, useRooms, useBookings)
  pages/            # Page components
    auth/           # Login, Register
    users/          # Users list, User edit
    rooms/          # Rooms list, Room details, Room form
    bookings/       # My bookings, Admin bookings
    layout/         # MainLayout, AuthLayout
  components/       # Reusable components
  router/           # AppRouter with route guards
  theme/            # Ant Design theme configuration
  App.tsx           # Main app component
  main.tsx          # Entry point
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

## Features

### Authentication
- Login/Register pages
- JWT token management
- Protected routes
- Auto-logout on 401 errors

### Users Module (Admin)
- List all users with pagination
- Search and filter users
- Edit user details and roles
- Delete users

### Rooms Module
- Browse all rooms with filters
- View room details with images
- Book rooms with date/time selection
- Admin: Create, edit, delete rooms

### Bookings Module
- View personal bookings
- Cancel bookings
- Admin: View all bookings, update status

## Design System

- **Primary Color**: #1677FF (Ant Design blue)
- **Secondary Color**: #13C2C2 (Teal)
- **Background**: #F5F5F5
- **Text Primary**: #1F1F1F
- **Text Secondary**: #595959
- **Border Radius**: 8px (cards), 6px (buttons/inputs)

## API Integration

The frontend connects to the NestJS backend API at `http://localhost:3000/api`. All API calls are handled through:

- `axiosClient` - Configured Axios instance with interceptors
- API modules in `src/api/` - Type-safe API functions
- TanStack Query hooks - Server state management

## Route Guards

- `ProtectedRoute` - Requires authentication
- `AdminRoute` - Requires Admin role

## State Management

- **Zustand** for client state (auth, UI)
- **TanStack Query** for server state (caching, mutations)

