import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const { isAdminAuthenticated, loading: adminLoading } = useContext(AdminAuthContext);

  if (loading || (adminOnly && adminLoading)) {
    return <Loader />;
  }

  if (adminOnly) {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role && ['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
