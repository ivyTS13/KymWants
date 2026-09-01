import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-earth-green p-4 font-sans text-earth-maroon">
      <div className="w-full max-w-md bg-earth-beige border border-earth-rust/20 rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-earth-rust flex items-center justify-center mb-4 mx-auto shadow-md">
            <CuteGirlAvatar width={64} height={64} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            Reset your password
          </h2>
          <p className="text-sm text-earth-maroon/70">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="bg-earth-maroon/10 border border-earth-maroon text-earth-maroon px-3 py-2 rounded-md text-sm mb-5 text-center font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-earth-rust/10 border border-earth-rust text-earth-rust px-3 py-2 rounded-md text-sm mb-5 text-center font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-earth-maroon">
              Email address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-earth-rust/40 rounded-md px-3 py-2 text-sm text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-1 focus:ring-earth-rust transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-earth-rust text-earth-beige px-4 py-2.5 rounded-md text-sm font-bold hover:bg-earth-maroon transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-earth-rust focus:ring-offset-2 focus:ring-offset-earth-beige"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-earth-maroon/70">
          <Link
            to={PATHS.LOGIN}
            className="text-earth-rust font-bold hover:text-earth-maroon transition-colors"
          >
            Back to login
          </Link>
        </div>
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
