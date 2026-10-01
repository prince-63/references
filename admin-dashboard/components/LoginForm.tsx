'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(username, password);

    if (!success) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 sm:px-6">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/Dental Stack Logo.svg"
              alt="Dental Stack"
              width={60}
              height={60}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
          autoComplete="off"
        >
          <div className="rounded-lg space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-colors hover:border-gray-400 focus:border-[#735bf2] focus:ring-2 focus:ring-[#735bf2]/20"
                placeholder="Enter username"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="one-time-code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 outline-none transition-colors hover:border-gray-400 focus:border-[#735bf2] focus:ring-2 focus:ring-[#735bf2]/20"
                placeholder="Enter password"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-[#735bf2] hover:bg-[#5d47c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Internal access only - Support, QA, and Marketing teams
        </p>
      </div>
    </div>
  );
}
