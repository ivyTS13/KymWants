import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import ProtectedRoute from "./ProtectedRoute";

import AuthPage from "../pages/AuthPage";
import NotFoundPage from "../pages/NotFoundPage";
import KymDashboard from "../pages/KymDashBoard";

export const PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
};

export default function AppRoutes() {
  const checkAuth = useUserStore((state) => state.checkAuth);
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-earth-beige flex flex-col items-center justify-center p-4 text-center font-sans">
        {/* Animated Graphic */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          {/* Outer expanding ring */}
          <div className="absolute inset-0 rounded-full border-4 border-earth-rust/30 animate-ping"></div>
          {/* Middle spinning track */}
          <div
            className="absolute inset-2 rounded-full border-4 border-earth-rust/20 border-t-earth-rust animate-spin"
            style={{ animationDuration: "1.5s" }}
          ></div>
          {/* Inner fast spinner */}
          <div
            className="absolute inset-6 rounded-full border-4 border-transparent border-t-earth-maroon border-b-earth-maroon animate-spin"
            style={{ animationDuration: "0.8s" }}
          ></div>
          {/* Center core */}
          <div className="w-4 h-4 bg-earth-maroon rounded-full animate-pulse"></div>
        </div>

        {/* Messaging */}
        <h2 className="text-2xl font-bold text-earth-maroon mb-3 animate-pulse">
          Waking up the server...
        </h2>
        <p className="text-sm font-medium text-earth-maroon/70 max-w-xs leading-relaxed">
          We use a free hosting service that goes to sleep when inactive. It
          might take{" "}
          <span className="font-bold text-earth-rust">up to a minute</span> for
          things to get fully ready.
          <br />
          <br />
          Grab a quick sip of water!
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard if logged in, otherwise login */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? PATHS.DASHBOARD : PATHS.LOGIN}
              replace
            />
          }
        />

        {/* Public Routes */}
        <Route path={PATHS.LOGIN} element={<AuthPage initialMode="login" />} />
        <Route
          path={PATHS.REGISTER}
          element={<AuthPage initialMode="register" />}
        />

        {/* Protected Routes - Everything inside here requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.DASHBOARD} element={<KymDashboard />} />
          {/* Add more protected routes here like /settings, /profile */}
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
