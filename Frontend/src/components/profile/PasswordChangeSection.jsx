import React, { useState } from "react";
import apiClient from "../../api/axios";
import { KeyIcon, CheckIcon, SpinnerIcon } from "../icons/UiIcons";

export default function PasswordChangeSection() {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, error: null, success: null });

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({
        loading: false,
        error: "New passwords do not match.",
        success: null,
      });
    }

    setStatus({ loading: true, error: null, success: null });

    try {
      await apiClient.post("/Auth/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      setStatus({ loading: false, error: null, success: "Password changed successfully!" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || "Failed to change password.",
        success: null,
      });
    }
  };

  return (
    <section className="bg-white/90 backdrop-blur-md border border-earth-rust/15 shadow-xs rounded-3xl overflow-hidden transition-all">
      <div className="px-6 py-5 border-b border-earth-rust/10 bg-earth-beige/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-earth-green/10 flex items-center justify-center text-earth-green">
          <KeyIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-earth-maroon">Change Password</h2>
          <p className="text-xs text-earth-maroon/60">Keep your dining studio account secure.</p>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="px-6 py-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="current-password" className="block text-xs font-bold text-earth-maroon/80">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              className="block w-full md:w-1/2 border border-earth-rust/20 rounded-2xl shadow-2xs py-2.5 px-3.5 text-sm text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust/30 focus:border-earth-rust bg-white transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-new-password" className="block text-xs font-bold text-earth-maroon/80">
              New Password
            </label>
            <input
              id="profile-new-password"
              type="password"
              required
              minLength={6}
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="block w-full border border-earth-rust/20 rounded-2xl shadow-2xs py-2.5 px-3.5 text-sm text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust/30 focus:border-earth-rust bg-white transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-confirm-password" className="block text-xs font-bold text-earth-maroon/80">
              Confirm New Password
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              required
              minLength={6}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="block w-full border border-earth-rust/20 rounded-2xl shadow-2xs py-2.5 px-3.5 text-sm text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust/30 focus:border-earth-rust bg-white transition-all"
              placeholder="Repeat new password"
            />
          </div>
        </div>

        {/* Status Messages */}
        {status.error && (
          <div role="alert" className="text-red-700 font-medium text-xs bg-red-50/90 border border-red-200/70 p-3 rounded-2xl max-w-md">
            {status.error}
          </div>
        )}
        {status.success && (
          <div role="status" className="flex items-center gap-2 text-earth-green font-bold text-xs bg-earth-green/10 border border-earth-green/20 p-3 rounded-2xl max-w-md">
            <CheckIcon className="w-4 h-4 text-earth-green" />
            {status.success}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={status.loading}
            className="inline-flex items-center gap-2 justify-center py-2.5 px-6 shadow-xs text-xs font-bold rounded-full text-white bg-earth-green hover:bg-earth-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-green disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {status.loading ? (
              <>
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
