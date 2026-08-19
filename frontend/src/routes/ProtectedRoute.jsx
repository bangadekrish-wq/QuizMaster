import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const FullPageSpinner = ({ message = 'Connecting to server...' }) => (
  <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
    <p className="text-sm font-medium text-slate-400">{message}</p>
  </div>
);

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <FullPageSpinner message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner message="Authenticating administrator session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (role !== 'ADMIN') {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Outlet />;
};

export const StudentRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner message="Authenticating student session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'STUDENT') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};
