import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/axios";
import { PATHS } from "../router/paths";
import AuthLayout from "../components/layout/AuthLayout";

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
      setMessage(
        "If the email is registered, a password reset link has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
      title="Reset Password"
      subtitle="Enter your email and we'll send you a recovery link."
      error={error}
      success={message}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="forgot-email"
            className="text-xs font-bold text-earth-maroon"
          >
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
    </AuthLayout>
  );
}
