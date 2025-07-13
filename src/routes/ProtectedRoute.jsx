import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token');
  
  // Get role from localStorage - handle both old and new format
  let role;
  const storedRole = localStorage.getItem('role');
  const storedRoles = localStorage.getItem('roles');
  
  if (storedRole) {
    // Old format - direct role number
    role = Number(storedRole);
  } else if (storedRoles) {
    // New format - roles array, convert to role number
    const roles = JSON.parse(storedRoles);
    if (roles.includes('ROLE_PARENT')) {
      role = 1;
    } else if (roles.includes('ROLE_NURSE')) {
      role = 2;
    // } else if (roles.includes('ROLE_ADMIN')) {
    //   role = 3;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;