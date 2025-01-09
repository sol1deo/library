import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AuthLayout } from './components/AuthLayout';
import { ProtectedLayout } from './components/ProtectedLayout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { Favorites } from './pages/Favorites';
import { AllBooks } from './pages/AllBooks';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/all-books" element={<AllBooks />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}