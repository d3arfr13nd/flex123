import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { authStore } from '../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const user = authStore((state) => state.user);
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'Admin') {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" href="/rooms">
            Go to Rooms
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

