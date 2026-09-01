import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import apiClient from '../api/axios';
import { PATHS } from '../router/AppRoutes';
import Layout from '../components/KymLayout';

export default function KymDashboard() {
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
    <Layout>
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
    </Layout>
  );
}