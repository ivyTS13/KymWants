import React from "react";
import BobaLogo from "../BobaLogo";
import FloatingFoodBackground from "../FloatingFoodBackground";

/**
 * Cohesive layout shell for authentication and gatekeeper pages.
 * Enforces unified typography, card proportions, ambient food animations, and accessible alerts.
 */
export default function AuthLayout({
  title,
  subtitle,
  icon,
  error,
  success,
  children,
  footer,
  maxWidth = "max-w-md",
}) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 font-sans text-earth-maroon relative overflow-hidden">
      <div
        className={`w-full ${maxWidth} bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-7 sm:p-9 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header Branding & Titles */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-earth-rust/10 border-2 border-earth-rust/20 flex items-center justify-center mb-3.5 mx-auto shadow-xs">
            {icon || <BobaLogo width={64} height={64} />}
          </div>
          {title && (
            <h2 className="text-xl sm:text-2xl font-extrabold mb-1 tracking-tight font-display text-earth-maroon">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-earth-maroon/70 leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Standardized Accessible Alerts */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-2xl text-xs mb-5 text-center font-medium animate-in fade-in"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-2xl text-xs mb-5 text-center font-medium animate-in fade-in"
          >
            {success}
          </div>
        )}

        {/* Content Body */}
        {children}

        {/* Optional Footer Slot */}
        {footer && <div className="mt-6 pt-4 border-t border-earth-rust/10 text-center">{footer}</div>}
      </div>

      <FloatingFoodBackground />
    </div>
  );
}
