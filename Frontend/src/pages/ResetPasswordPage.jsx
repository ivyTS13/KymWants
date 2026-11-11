import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios";
import { PATHS } from "../router/AppRoutes";
import CuteGirlAvatar from "../components/BobaLogo";
import FloatingFoodBackground from "../components/FloatingFoodBackground";

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
      // Matches your backend: public record ResetPasswordDto(string Token, string NewPassword);
      await apiClient.post("/Auth/reset-password", {
        token,
        newPassword,
      });

      setMessage(
        "Password has been successfully reset. Redirecting to login...",
      );

      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The token may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // If there's no token in the URL, immediately show an error
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 font-sans text-earth-maroon relative overflow-hidden">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-7 sm:p-9 text-center shadow-xl z-10">
          <div className="w-16 h-16 rounded-full bg-earth-rust/10 border-2 border-earth-rust/20 flex items-center justify-center mb-3.5 mx-auto shadow-xs">
            <CuteGirlAvatar width={56} height={56} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-earth-maroon mb-2 tracking-tight font-display">
            Invalid Link
          </h2>
          <p className="text-xs text-earth-maroon/70 mb-6 leading-relaxed">
            No reset token was found in the URL. Please request a new password
            reset link.
          </p>
          <Link
            to={PATHS.FORGOTPASS}
            className="inline-flex items-center justify-center bg-earth-rust text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all shadow-xs"
          >
            Request New Link
          </Link>
        </div>
        <FloatingFoodBackground />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 font-sans text-earth-maroon relative overflow-hidden">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-7 sm:p-9 shadow-xl z-10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-earth-rust/10 border-2 border-earth-rust/20 flex items-center justify-center mb-3.5 mx-auto shadow-xs">
            <CuteGirlAvatar width={64} height={64} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-1 tracking-tight font-display">
            New Password
          </h2>
          <p className="text-xs text-earth-maroon/70 leading-relaxed">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-2xl text-xs mb-5 text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-2xl text-xs mb-5 text-center font-medium animate-in fade-in">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-xs font-bold text-earth-maroon">
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
            <label htmlFor="confirm-password" className="text-xs font-bold text-earth-maroon">
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
      </div>

      <FloatingFoodBackground />
    </div>
  );
}
