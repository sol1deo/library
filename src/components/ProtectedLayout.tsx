import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';

export function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-[#f5f2ea] overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-white rounded-l-[40px] overflow-hidden">
        <div className="h-full overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}