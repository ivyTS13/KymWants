import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import useUserStore from "../store/useUserStore";
import { PATHS } from "../router/AppRoutes";
import BobaLogo from "./BobaLogo";

export default function Layout({ children }) {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/Auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearUser();
      setDropdownOpen(false);
      navigate(PATHS.LOGIN);
    }
  };

  const initial = (user?.displayName || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-earth-beige text-earth-maroon font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-earth-green shadow-md">
        {/* Changed: removed max-w and mx-auto, kept only padding */}
        <div className="px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + App name */}
            <Link
              to={PATHS.DASHBOARD}
              className="flex items-center gap-2 sm:gap-3"
            >
              <BobaLogo width={36} height={36} />
              <span className="text-earth-beige font-bold text-lg sm:text-xl tracking-wide">
                KymWants
              </span>
            </Link>

            {/* Right: Auth actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full bg-earth-rust hover:bg-earth-maroon text-earth-beige font-bold text-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-earth-maroon focus:ring-offset-2 focus:ring-offset-earth-green overflow-hidden"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={`${user.displayName}'s profile`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" /* Crucial for Google image URLs to prevent 403 errors */
                      />
                    ) : (
                      initial
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-earth-rust/30 rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-earth-rust/20">
                        <p className="text-sm font-semibold text-earth-maroon truncate">
                          {user?.displayName || "User"}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-earth-maroon/70 truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <Link
                        to={PATHS.PROFILEPAGE || PATHS.DASHBOARD}
                        className="block px-4 py-2 text-sm text-earth-maroon hover:bg-earth-rust/10 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-earth-maroon hover:bg-earth-rust/10 transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to={PATHS.LOGIN}
                    className="text-earth-beige hover:text-earth-rust text-sm font-semibold transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to={PATHS.REGISTER}
                    className="bg-earth-rust hover:bg-earth-maroon text-earth-beige px-3 py-1.5 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-earth-maroon focus:ring-offset-2 focus:ring-offset-earth-green"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-earth-green text-earth-beige py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BobaLogo width={24} height={24} />
            <span className="text-sm font-semibold">KymWants</span>
          </div>
          <p className="text-xs text-earth-beige/70 text-center sm:text-right">
            © {new Date().getFullYear()} KymWants. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
