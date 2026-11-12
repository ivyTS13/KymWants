import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios";
import { PATHS } from "../router/paths";
import useUserStore from "../store/useUserStore";
import AuthLayout from "../components/layout/AuthLayout";

export default function AuthPage({ initialMode = "login" }) {
  const isLogin = initialMode === "login";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const checkAuth = useUserStore((state) => state.checkAuth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = () => {
    const url = import.meta.env.VITE_API_URL || "https://localhost:7037";
    window.location.href = url + "/api/Auth/signin-google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await apiClient.post("/Auth/login", {
          email: formData.email,
          password: formData.password,
        });
      } else {
        await apiClient.post("/Auth/register", {
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
        });
      }

      await checkAuth();
      navigate(PATHS.DASHBOARD);
    } catch (err) {
      console.log("Axios Error Response:", err.response);
      const serverError =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.response?.data?.title;

      setError(serverError || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title = isLogin ? "Welcome Back" : "Create Account";
  const subtitle = isLogin
    ? "Sign in to plan and spin your favorite meals"
    : "Start organizing your aesthetic food collections";

  const footer = (
    <div className="text-xs text-earth-maroon/70">
      {isLogin ? (
        <p>
          Don't have an account?{" "}
          <Link
            to={PATHS.REGISTER}
            className="text-earth-rust font-bold hover:underline"
          >
            Sign up
          </Link>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <Link
            to={PATHS.LOGIN}
            className="text-earth-rust font-bold hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );

  return (
    <AuthLayout title={title} subtitle={subtitle} error={error} footer={footer}>
      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white border border-earth-rust/20 text-earth-maroon px-4 py-2.5 rounded-full text-xs font-bold hover:bg-earth-beige/40 transition-all focus:ring-2 focus:ring-earth-rust/30 shadow-xs mb-5"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center mb-5">
        <div className="flex-1 h-px bg-earth-rust/15"></div>
        <span className="px-3 text-xs font-medium text-earth-maroon/60">
          or with email
        </span>
        <div className="flex-1 h-px bg-earth-rust/15"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {!isLogin && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="auth-displayname"
              className="text-xs font-bold text-earth-maroon"
            >
              Display Name
            </label>
            <input
              id="auth-displayname"
              type="text"
              name="displayName"
              required
              placeholder="e.g. Kym"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/55 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 transition-shadow"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="auth-email"
            className="text-xs font-bold text-earth-maroon"
          >
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            name="email"
            required
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/55 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 transition-shadow"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="auth-password"
              className="text-xs font-bold text-earth-maroon"
            >
              Password
            </label>
            {isLogin && (
              <Link
                to={PATHS.FORGOTPASS}
                className="text-[11px] text-earth-rust font-semibold hover:text-earth-maroon transition-colors"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="auth-password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/55 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-earth-rust text-white px-4 py-3 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-earth-rust"
        >
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Create My Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
