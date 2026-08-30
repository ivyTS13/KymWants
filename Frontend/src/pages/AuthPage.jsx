import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { PATHS } from '../router/AppRoutes';
import useUserStore from '../store/useUserStore';

export default function AuthPage({ initialMode = 'login' }) {
  const isLogin = initialMode === 'login';
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser); // Zustand hook

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'https://localhost:7037/api/Auth/signin-google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await apiClient.post('/Auth/login', {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await apiClient.post('/Auth/register', {
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
        });
      }

      // Update Zustand store (assuming the API returns user data like { id, email, displayName })
      // If your API just returns { message: "Success" }, you might need to call a /me endpoint here first.
      setUser(response.data.user || { email: formData.email }); 
      
      navigate(PATHS.DASHBOARD);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-green p-4 font-sans text-earth-maroon">
      <div className="w-full max-w-md bg-earth-beige border border-earth-rust/20 rounded-xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-earth-rust text-earth-beige rounded-lg flex items-center justify-center font-bold text-xl mb-4 mx-auto shadow-lg shadow-earth-rust/30">
            K
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            {isLogin ? 'Log in to KymWants' : 'Create your account'}
          </h2>
          <p className="text-sm text-earth-maroon/70">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Start managing your collections today.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-earth-maroon/10 border border-earth-maroon text-earth-maroon px-3 py-2 rounded-md text-sm mb-5 text-center font-medium">
            {error}
          </div>
        )}

        {/* Google Button */}
        <button 
          type="button" 
          onClick={handleGoogleSignIn} 
          className="w-full flex items-center justify-center gap-3 bg-white text-earth-maroon px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-earth-rust focus:ring-offset-2 focus:ring-offset-earth-beige shadow-sm"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-earth-rust/30"></div>
          <span className="px-3 text-xs font-bold text-earth-maroon/60 uppercase">OR</span>
          <div className="flex-1 h-px bg-earth-rust/30"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-earth-maroon">Display Name</label>
              <input
                type="text"
                name="displayName"
                required
                placeholder="John Doe"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-white border border-earth-rust/40 rounded-md px-3 py-2 text-sm text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-1 focus:ring-earth-rust transition-shadow"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-earth-maroon">Email address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-earth-rust/40 rounded-md px-3 py-2 text-sm text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-1 focus:ring-earth-rust transition-shadow"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-earth-maroon">Password</label>
              {isLogin && <a href="#" className="text-xs text-earth-rust font-semibold hover:text-earth-maroon transition-colors">Forgot password?</a>}
            </div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-earth-rust/40 rounded-md px-3 py-2 text-sm text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-1 focus:ring-earth-rust transition-shadow"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-earth-rust text-earth-beige px-4 py-2.5 rounded-md text-sm font-bold hover:bg-earth-maroon transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-earth-rust focus:ring-offset-2 focus:ring-offset-earth-beige"
          >
            {loading ? 'Processing...' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-earth-maroon/70">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <Link to={PATHS.REGISTER} className="text-earth-rust font-bold hover:text-earth-maroon transition-colors">
                Sign up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link to={PATHS.LOGIN} className="text-earth-rust font-bold hover:text-earth-maroon transition-colors">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}