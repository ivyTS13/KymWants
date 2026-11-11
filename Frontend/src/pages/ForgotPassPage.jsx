import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/axios";
import { PATHS } from "../router/AppRoutes";
import CuteGirlAvatar from "../components/BobaLogo";
import FloatingFoodBackground from "../components/FloatingFoodBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiClient.post("/Auth/forgot-password", { email });
      // Backend always returns OK, even if email not found (to prevent enumeration)
      setMessage(
        "If the email is registered, a password reset link has been sent.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 font-sans text-earth-maroon relative overflow-hidden">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-7 sm:p-9 shadow-xl z-10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-earth-rust/10 border-2 border-earth-rust/20 flex items-center justify-center mb-3.5 mx-auto shadow-xs">
            <CuteGirlAvatar width={64} height={64} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-1 tracking-tight font-display">
            Reset Password
          </h2>
          <p className="text-xs text-earth-maroon/70 leading-relaxed">
            Enter your email and we'll send you a recovery link.
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
            <label htmlFor="forgot-email" className="text-xs font-bold text-earth-maroon">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/55 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-earth-rust text-white px-4 py-3 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-earth-rust"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-earth-maroon/70">
          <Link
            to={PATHS.LOGIN}
            className="text-earth-rust font-bold hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
      <FloatingFoodBackground />
    </div>
  );
}
