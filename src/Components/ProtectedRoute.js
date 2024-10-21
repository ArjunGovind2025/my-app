// src/Components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCombined } from './CollegeContext'; // Your auth context



const ProtectedRoute = ({ children }) => {
  const { user } = useCombined(); // Check if the user is authenticated

  if (user === undefined) {
    // If user is still undefined (auth state not yet determined), show a loading spinner
    return <div>Loading...</div>; // You can replace this with a better loading component if needed
  }

  if (!user) {
    // If user is null or non-existent, redirect to login
    console.log("Redirecting to login");
    return <Navigate to="/login" />;
  }

  // If the user is authenticated, allow access
  return children;
};





export default ProtectedRoute;
