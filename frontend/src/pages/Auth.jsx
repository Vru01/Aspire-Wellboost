import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function Auth({ mode = 'login', onAuthSuccess }) {
  const navigate = useNavigate();
  const isSignup = mode === 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        email: form.email,
        password: form.password,
        ...(isSignup ? { name: form.name, phone: form.phone } : {})
      };

      // 1. Execute the primary authentication request
      const response = isSignup
        ? await api.auth.signup(payload)
        : await api.auth.login(payload);

      let targetUser = response?.user || (response?.token ? response : null);

      // If the user just signed up and the backend didn't return a token,
      // perform an immediate silent login to fetch and cache their JWT token.
      if (isSignup && !targetUser?.token) {
        console.log("🔄 Account created. Performing silent automatic login...");
        const loginResponse = await api.auth.login({
          email: form.email,
          password: form.password
        });
        targetUser = loginResponse?.user || (loginResponse?.token ? loginResponse : null);
      }

      if (targetUser) {
        // Extract the user record payload safely whether nested or flat
        const userProfile = targetUser.user || targetUser;
        const tokenString = targetUser.token;

        if (tokenString) {
          localStorage.setItem('token', tokenString);
        }

        // 🟢 CRUCIAL FIX: Unify localStorage keys with Login.jsx so components like CartDrawer, 
        // ProductDetails, and Navbar read the exact same user object property layouts.
        localStorage.setItem('user', JSON.stringify({
          _id: userProfile._id || userProfile.id,
          id: userProfile._id || userProfile.id, // Keeps both properties alive for fallbacks
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          role: userProfile.role || 'user'
        }));
        
        onAuthSuccess?.(userProfile);
        navigate('/');
      } else {
        setError('Authentication response layout mismatch. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unable to complete the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#F1FFF9] via-white to-[#fff7fb] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:flex-row">
        <div className="bg-gradient-to-br from-[#00D9A0] to-[#00A87D] p-8 text-white lg:w-2/5">
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpeg"
              alt="Aspire Wellboost logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
            />
            <span className="text-lg font-black">Aspire Wellboost</span>
          </div>
          <h1 className="mt-8 text-3xl font-black leading-tight">
            {isSignup ? 'Create your wellness account' : 'Welcome back'}
          </h1>
          <p className="mt-3 text-sm text-white/90">
            {isSignup
              ? 'Sign up to track orders, save favorites, and enjoy a faster checkout.'
              : 'Log in to continue shopping and manage your wellness routine.'}
          </p>
        </div>

        <div className="flex-1 p-8">
          <div className="mb-6 flex items-center gap-2">
            <Link to="/login" className={`rounded-full px-4 py-2 text-sm font-bold ${!isSignup ? 'bg-[#00D9A0] text-white' : 'bg-slate-100 text-slate-600'}`}>
              Login
            </Link>
            <Link to="/signup" className={`rounded-full px-4 py-2 text-sm font-bold ${isSignup ? 'bg-[#00D9A0] text-white' : 'bg-slate-100 text-slate-600'}`}>
              Sign Up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D9A0]"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D9A0]"
                placeholder="you@example.com"
              />
            </div>

            {isSignup && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D9A0]"
                  placeholder="10-digit phone number"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#00D9A0]"
                placeholder="Enter password"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0B1F1A] px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}