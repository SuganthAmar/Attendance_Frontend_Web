// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authToken } = useAuth(); // Get authToken from AuthContext

  if (!authToken) {
    // If no token, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components
  return <>{children}</>;
};
