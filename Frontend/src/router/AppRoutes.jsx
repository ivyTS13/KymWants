import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import ProtectedRoute from "./ProtectedRoute";
import { PATHS } from "./paths";
import AuthLayout from "../components/layout/AuthLayout";

// Lazy-loaded route views for code splitting
const AuthPage = lazy(() => import("../pages/AuthPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const KymDashboard = lazy(() => import("../pages/KymDashBoard"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPassPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const AdminPdfManager = lazy(() => import("../pages/AdminPdfManager"));

export { PATHS };

function PageFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] text-earth-maroon p-6 font-sans"
    >
      <div className="w-12 h-12 rounded-2xl bg-earth-rust/10 border border-earth-rust/20 flex items-center justify-center shadow-xs mb-3">
        <span className="w-5 h-5 rounded-full border-2 border-earth-rust/30 border-t-earth-rust animate-spin" />
      </div>
      <span className="text-xs font-bold text-earth-maroon/70 tracking-wide">
        Loading...
      </span>
    </div>
  );
}

function UnauthorizedPage() {
  const icon = (
    <div className="w-16 h-16 bg-earth-rust/10 border border-earth-rust/20 text-earth-rust rounded-2xl flex items-center justify-center shadow-xs">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7a4 4 0 00-8 0v4H3a1 1 0 00-1 1v6a1 1 0 001 1h14a1 1 0 001-1v-6a1 1 0 00-1-1h-1z" />
      </svg>
    </div>
  );

  return (
    <AuthLayout
      title="403"
      subtitle="You don't have superuser permission to view this section. Please return to your dining studio."
      icon={icon}
    >
      <div className="text-center pt-2">
        <Link
          to={PATHS.DASHBOARD}
          className="inline-flex items-center gap-2 bg-earth-rust text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all shadow-xs hover:shadow-sm"
        >
          Return to Studio
        </Link>
      </div>
    </AuthLayout>
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
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      )}
    </BrowserRouter>
  );
}
