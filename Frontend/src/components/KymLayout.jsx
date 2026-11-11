import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import useUserStore from "../store/useUserStore";
import { PATHS } from "../router/AppRoutes";
import BobaLogo from "./BobaLogo";
import FloatingChat from "./FloatingChat";

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
      {/* Sleek Café-Aesthetic Navbar */}
      <header
        aria-label="Main navigation"
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-earth-rust/15 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + App name with boutique pill accent */}
            <Link
              to={PATHS.DASHBOARD}
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="w-9 h-9 rounded-full bg-earth-rust/10 flex items-center justify-center p-1 border border-earth-rust/20 shadow-xs group-hover:bg-earth-rust/20 transition-colors">
                <BobaLogo width={28} height={28} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-xl tracking-tight text-earth-maroon group-hover:text-earth-rust transition-colors font-display">
                  KymWants
                </span>
              </div>
            </Link>

            {/* Right: Auth actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="User account menu"
                    className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full bg-white border border-earth-rust/25 hover:border-earth-rust/60 shadow-xs hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-earth-rust/40"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <span className="text-xs font-semibold text-earth-maroon max-w-[110px] truncate hidden sm:inline">
                      {user?.displayName || "My Profile"}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-earth-rust text-white font-bold text-sm flex items-center justify-center overflow-hidden ring-2 ring-white shadow-xs">
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={`${user.displayName}'s profile`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </button>

                  {/* Dropdown menu with refined boutique card styling */}
                  {dropdownOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2.5 w-52 bg-white border border-earth-rust/20 rounded-2xl shadow-xl py-1.5 z-50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 py-2.5 border-b border-earth-rust/10 bg-earth-beige/30">
                        <p className="text-xs font-bold text-earth-maroon truncate">
                          {user?.displayName || "User"}
                        </p>
                        {user?.email && (
                          <p className="text-[11px] text-earth-maroon/60 truncate mt-0.5">
                            {user.email}
                          </p>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          role="menuitem"
                          to={PATHS.PROFILEPAGE || PATHS.DASHBOARD}
                          className="block px-4 py-2 text-xs font-semibold text-earth-maroon hover:bg-earth-rust/10 hover:text-earth-rust transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Account Profile
                        </Link>

                        {/* Documents Link - Superuser Only */}
                        {user?.isSuperUser && (
                          <Link
                            role="menuitem"
                            to={PATHS.DOCUMENTS}
                            className="block px-4 py-2 text-xs font-semibold text-earth-maroon hover:bg-earth-rust/10 hover:text-earth-rust transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Knowledge Base
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-earth-rust/10 pt-1">
                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={PATHS.LOGIN}
                    className="text-earth-maroon hover:text-earth-rust text-xs font-bold px-3.5 py-2 rounded-full transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to={PATHS.REGISTER}
                    className="bg-earth-rust hover:bg-earth-maroon text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-earth-rust"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {children}
      </main>

      {/* Aesthetic Footer */}
      <footer
        aria-label="Site footer"
        className="bg-white/60 border-t border-earth-rust/15 py-5 mt-auto text-earth-maroon/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BobaLogo width={20} height={20} />
            <span className="text-xs font-bold text-earth-maroon tracking-tight">
              KymWants
            </span>
            <span className="text-xs text-earth-maroon/60">•</span>
            <span className="text-xs text-earth-maroon/70">
              Cozy dining decisions
            </span>
          </div>
          <p className="text-[11px] text-earth-maroon/70 text-center sm:text-right">
            © {new Date().getFullYear()} KymWants. Crafted with love.
          </p>
        </div>
      </footer>

      {isAuthenticated && <FloatingChat />}
    </div>
  );
}
