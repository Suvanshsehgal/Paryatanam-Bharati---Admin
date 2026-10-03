import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, hasRole } from '../../store/useAuthStore';
import { authApi } from '../../api/authApi';

// Roles can change server-side (e.g. an Admin edits another Admin's roles), so
// the stored profile is re-validated once per page load. A fresh login already
// returns current roles.
let profileRefreshed = false;

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isAdmin, user, updateUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || profileRefreshed) return;
    profileRefreshed = true;
    authApi
      .me()
      .then((freshUser) => {
        if (freshUser && Array.isArray(freshUser.roles)) updateUser(freshUser);
      })
      .catch(() => {
        // 401s are handled by the API client (refresh or sign-out).
        profileRefreshed = false;
      });
  }, [isAuthenticated, updateUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  if (roles && !roles.some((role) => hasRole(user, role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
