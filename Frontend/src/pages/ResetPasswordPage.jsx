import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/axios";
import { PATHS } from "../router/AppRoutes";
import CuteGirlAvatar from "../components/BobaLogo";
import DonutIcon from "../assets/Snacks/Donut";
import CupcakeIcon from "../assets/Snacks/Cupcake";
import IceCreamIcon from "../assets/Snacks/IceCream";
import CoffeeIcon from "../assets/Snacks/Coffee";
import SodaIcon from "../assets/Snacks/SodaCup";
import FriesIcon from "../assets/Snacks/FrenchFries";
import CookieIcon from "../assets/Snacks/Cookies";
import PizzaIcon from "../assets/Snacks/Pizza";

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
      <div className="min-h-screen flex items-center justify-center bg-earth-green p-4 font-sans">
        <div className="w-full max-w-md bg-earth-beige border border-earth-rust/20 rounded-xl p-6 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-earth-maroon mb-4">
            Invalid Link
          </h2>
          <p className="text-earth-maroon/70 mb-6">
            No reset token was found in the URL. Please request a new password
            reset link.
          </p>
          <Link
            to="/forgot-password"
            className="text-earth-rust font-bold hover:underline"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-green p-4 font-sans text-earth-maroon">
      <div className="w-full max-w-md bg-earth-beige border border-earth-rust/20 rounded-xl p-6 sm:p-8 shadow-2xl z-10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-earth-rust flex items-center justify-center mb-4 mx-auto shadow-md">
            <CuteGirlAvatar width={64} height={64} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            Create new password
          </h2>
          <p className="text-base sm:text-sm text-earth-maroon/70">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="bg-earth-maroon/10 border border-earth-maroon text-earth-maroon px-3 py-2 rounded-md text-base sm:text-sm mb-5 text-center font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-earth-rust/10 border border-earth-rust text-earth-rust px-3 py-2 rounded-md text-base sm:text-sm mb-5 text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-earth-maroon">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-earth-rust/40 rounded-md px-3 py-2 text-base sm:text-sm text-earth-maroon focus:outline-none focus:border-earth-rust focus:ring-1 focus:ring-earth-rust"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-earth-maroon">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-earth-rust/40 rounded-md px-3 py-2 text-base sm:text-sm text-earth-maroon focus:outline-none focus:border-earth-rust focus:ring-1 focus:ring-earth-rust"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-earth-rust text-earth-beige px-4 py-2.5 rounded-md text-base sm:text-sm font-bold hover:bg-earth-maroon transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-[10%] top-[20%]"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          <DonutIcon width={40} height={40} />
        </div>
        <div
          className="absolute left-[80%] top-[10%]"
          style={{ animation: "float 7s ease-in-out 1s infinite" }}
        >
          <CupcakeIcon width={35} height={35} />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute left-[5%] top-[15%]"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <IceCreamIcon width={40} height={40} />
          </div>
          <div
            className="absolute left-[75%] top-[30%]"
            style={{ animation: "float 4s ease-in-out 1s infinite" }}
          >
            <CoffeeIcon width={35} height={35} />
          </div>
          <div
            className="absolute left-[20%] top-[90%]"
            style={{ animation: "float 8s ease-in-out 0.5s infinite" }}
          >
            <SodaIcon width={38} height={38} />
          </div>
          <div
            className="absolute left-[70%] top-[85%]"
            style={{ animation: "float 6.5s ease-in-out 1.5s infinite" }}
          >
            <FriesIcon width={42} height={42} />
          </div>
          <div
            className="absolute left-[50%] top-[95%]"
            style={{ animation: "float 3.5s ease-in-out 1.5s infinite" }}
          >
            <PizzaIcon width={42} height={42} />
          </div>
          <div
            className="absolute left-[45%] top-[5%]"
            style={{ animation: "float 7.5s ease-in-out 0.8s infinite" }}
          >
            <CookieIcon width={36} height={36} />
          </div>
        </div>
      </div>
    </div>
  );
}
