// Components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute - Token exists:', !!token);
  return !!token; // Returns true if a token exists
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" />;
  }
  console.log('ProtectedRoute - Token is valid, rendering children');
  return children;
};

export default ProtectedRoute;