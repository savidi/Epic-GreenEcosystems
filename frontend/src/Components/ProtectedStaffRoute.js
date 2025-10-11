import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedStaffRoute = ({ children, allowedStaffTypes = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 Prevent browser from navigating back to cached pages after logout
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('staffToken');
      const staffType = localStorage.getItem('staffType');

      // If no token, not authenticated
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get('http://localhost:5000/staff/verify/token', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 'success') {
          // Check allowed staff types (if any)
          if (allowedStaffTypes.length > 0 && !allowedStaffTypes.includes(staffType)) {
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token verification failed:', error);

        // Clear stored session data if verification fails
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffType');
        localStorage.removeItem('staffName');
        localStorage.removeItem('staffId');
        localStorage.removeItem('staffEmail');

        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    verifyToken();
  }, [allowedStaffTypes]);

  // Loading state (optional nice UI)
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
        }}
      >
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/staff-login" replace />;
  }

  // Allow access to protected route
  return children;
};

export default ProtectedStaffRoute;
