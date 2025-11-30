import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { RoomsListPage } from '../pages/rooms/RoomsListPage';
import { RoomDetailsPage } from '../pages/rooms/RoomDetailsPage';
import { MyBookingsPage } from '../pages/bookings/MyBookingsPage';
import { BookingsAdminPage } from '../pages/bookings/BookingsAdminPage';
import { UsersListPage } from '../pages/users/UsersListPage';
import { ProfilePage } from '../pages/users/ProfilePage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';
import { authStore } from '../store/authStore';

export const AppRouter: React.FC = () => {
  // Use a component that subscribes to auth changes
  const AuthRouter = () => {
    const isAuthenticated = authStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <RoomsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/:id"
          element={
            <ProtectedRoute>
              <RoomDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/my"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/bookings"
          element={
            <AdminRoute>
              <BookingsAdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersListPage />
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/rooms" replace /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
  };

  return <AuthRouter />;
};

