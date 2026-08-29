import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../lib/auth';

export default function ProtectedRoute({ children, roles, redirectTo = '/login' }) {
  const { user, booting } = useAuth();
  const location = useLocation();
  const role = normalizeRole(user?.role);

  if (!user && !booting) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (user && roles?.length && !roles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'driver') return <Navigate to="/driver" replace />;
    if (role === 'customer') return <Navigate to="/account" replace />;
    return <Navigate to="/account" replace />;
  }

  return children;
}
