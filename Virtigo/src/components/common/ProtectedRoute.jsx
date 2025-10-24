import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { isAuthenticated, getUserRole, getRedirectPath } from '../../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (!isAuthenticated()) {
          navigate(redirectTo);
          return;
        }

        const userRole = getUserRole();
        
        // Check if user role is in allowed roles
        if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          // If user is not authorized, redirect based on their role
          const redirectPath = getRedirectPath(userRole);
          navigate(redirectPath);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        navigate(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute; 