import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import ProtectedRoute from "./ProtectedRoute";

import AuthPage from "../pages/AuthPage";
import NotFoundPage from "../pages/NotFoundPage";
import KymDashboard from "../pages/KymDashBoard";
import ForgotPasswordPage from "../pages/ForgotPassPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import AdminPdfManager from "../pages/AdminPdfManager";

export const PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOTPASS: "/forgot",
  DASHBOARD: "/dashboard",
  RESETPASSWORD: "/reset-password",
  PROFILEPAGE: "/profile",
  DOCUMENTS: "/documents",
  UNAUTHORIZED: "/unauthorized",
};

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 font-sans text-center">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-8 shadow-xl flex flex-col items-center">
        <div className="w-16 h-16 bg-earth-rust/10 border border-earth-rust/20 text-earth-rust rounded-2xl flex items-center justify-center mb-4 shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7a4 4 0 00-8 0v4H3a1 1 0 00-1 1v6a1 1 0 001 1h14a1 1 0 001-1v-6a1 1 0 00-1-1h-1z" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-earth-maroon tracking-tight mb-2 font-display">403</h1>
        <p className="text-xs text-earth-maroon/70 max-w-xs mb-6 leading-relaxed">
          You don't have superuser permission to view this section. Please return to your dining studio.
        </p>

        <Link
          to={PATHS.DASHBOARD}
          className="inline-flex items-center gap-2 bg-earth-rust text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all shadow-xs hover:shadow-sm"
        >
          Return to Studio
        </Link>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const checkAuth = useUserStore((state) => state.checkAuth);
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      {isCheckingAuth ? (
        <div className="min-h-screen bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] flex flex-col items-center justify-center p-6 text-center font-sans text-earth-maroon">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-earth-rust/10 border-2 border-earth-rust/20 flex items-center justify-center shadow-xs animate-pulse">
              <span className="w-8 h-8 rounded-full border-3 border-earth-rust/30 border-t-earth-rust animate-spin" />
            </div>
          </div>

          {/* Messaging */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-earth-maroon mb-2 tracking-tight font-display">
            Brewing up the kitchen...
          </h2>
          <p className="text-xs font-medium text-earth-maroon/70 max-w-xs leading-relaxed">
            Our server takes a little rest when inactive. It might take{" "}
            <span className="font-bold text-earth-rust">up to a minute</span> for
            everything to get fully ready.
            <br />
            <br />
            Grab a sip of tea or coffee while we get ready!
          </p>
        </div>
      ) : (
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
          <Route path={PATHS.FORGOTPASS} element={<ForgotPasswordPage />} />
          <Route path={PATHS.RESETPASSWORD} element={<ResetPasswordPage />} />
          <Route path={PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />

          {/* Standard Protected Routes (Accessible to ALL logged-in users) */}
          <Route element={<ProtectedRoute />}>
            <Route path={PATHS.DASHBOARD} element={<KymDashboard />} />
            <Route path={PATHS.PROFILEPAGE} element={<ProfilePage />} />
          </Route>

          {/* Admin-Only Protected Routes (Requires user.isSuperUser === true) */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path={PATHS.DOCUMENTS} element={<AdminPdfManager />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
