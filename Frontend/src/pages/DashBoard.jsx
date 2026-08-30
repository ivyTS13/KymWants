import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import apiClient from '../api/axios';
import { PATHS } from '../router/AppRoutes';

export default function Dashboard() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/Auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearUser();
      navigate(PATHS.LOGIN);
    }
  };

  return (
    <div className="min-h-screen bg-earth-beige text-earth-maroon p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12 bg-earth-green p-6 rounded-xl shadow-md">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-earth-beige">Dashboard</h1>
            <p className="text-earth-beige/80 text-sm">
              Welcome back, {user?.displayName || user?.email || 'User'}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-earth-rust hover:bg-earth-maroon text-earth-beige px-5 py-2 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-earth-maroon focus:ring-offset-2 focus:ring-offset-earth-green"
          >
            Log out
          </button>
        </header>

        {/* Temporary Content Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 p-6 rounded-xl border-2 border-earth-rust border-dashed h-48 flex items-center justify-center text-earth-maroon font-medium shadow-sm hover:bg-white transition-colors cursor-pointer">
            Your Collections
          </div>
          <div className="bg-white/60 p-6 rounded-xl border-2 border-earth-rust border-dashed h-48 flex items-center justify-center text-earth-maroon font-medium shadow-sm hover:bg-white transition-colors cursor-pointer">
            Your Dishes
          </div>
          <div className="bg-white/60 p-6 rounded-xl border-2 border-earth-rust border-dashed h-48 flex items-center justify-center text-earth-maroon font-medium shadow-sm hover:bg-white transition-colors cursor-pointer">
            Food Picker Widget
          </div>
        </div>
        
      </div>
    </div>
  );
}