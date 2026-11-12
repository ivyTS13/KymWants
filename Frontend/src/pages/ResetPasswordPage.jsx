import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios";
import { PATHS } from "../router/paths";
import AuthLayout from "../components/layout/AuthLayout";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract token from the URL (e.g., ?token=fM9YdiGb...)
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/Auth/reset-password", {
        token,
        newPassword,
      });

      setMessage(
        "Password has been successfully reset. Redirecting to login..."
      );

      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The token may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  // If there's no token in the URL, immediately show an error
  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="No reset token was found in the URL. Please request a new password reset link."
      >
        <div className="text-center pt-2">
          <Link
            to={PATHS.FORGOTPASS}
            className="inline-flex items-center justify-center bg-earth-rust text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all shadow-xs"
          >
            Request New Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const footer = (
    <Link
      to={PATHS.LOGIN}
      className="text-xs text-earth-rust font-bold hover:underline"
    >
      Back to login
    </Link>
  );

  return (
    <AuthLayout
      title="New Password"
      subtitle="Please enter your new password below."
      error={error}
      success={message}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="new-password"
            className="text-xs font-bold text-earth-maroon"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirm-password"
            className="text-xs font-bold text-earth-maroon"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-earth-rust text-white px-4 py-3 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow-sm"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
