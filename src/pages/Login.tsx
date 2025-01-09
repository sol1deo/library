import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f5f2ea] via-[#f5f2ea] to-[#e8e4d8] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Welcome Back</h2>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm outline-none focus:border-[#ff725e] focus:ring-1 focus:ring-[#ff725e]"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm outline-none focus:border-[#ff725e] focus:ring-1 focus:ring-[#ff725e]"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff725e] text-white py-3 px-4 rounded-lg hover:bg-[#ff8b7a] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#ff725e] hover:text-[#ff8b7a] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}