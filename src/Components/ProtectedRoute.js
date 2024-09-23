// src/Components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCombined } from './CollegeContext'; // Your auth context

const ProtectedRoute = ({ children }) => {
  const { user } = useCombined(); // Check if the user is authenticated

  if (!user) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  // If authenticated, allow access to the protected route
  return children;
};

export default ProtectedRoute;
