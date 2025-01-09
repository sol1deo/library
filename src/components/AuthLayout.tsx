import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f5f2ea] via-[#f5f2ea] to-[#e8e4d8] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}