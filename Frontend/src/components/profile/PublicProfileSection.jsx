import React, { useState, useRef, useEffect } from "react";
import apiClient from "../../api/axios";
import { UserIcon, EditPencilIcon, CheckIcon, SpinnerIcon } from "../icons/UiIcons";

export default function PublicProfileSection({ user, onProfileUpdated }) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImageUrl || "");
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const fileInputRef = useRef(null);

  // Sync state if user changes externally
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPreviewUrl(user.profileImageUrl || "");
    }
  }, [user]);

  // Clean up blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    try {
      const formData = new FormData();
      formData.append("DisplayName", displayName);
      if (profileImage) {
        formData.append("ProfileImage", profileImage);
      }

      const response = await apiClient.put("/Users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onProfileUpdated?.(response.data);
      setStatus({ loading: false, error: null, success: "Profile updated successfully!" });
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || "Failed to update profile.",
        success: null,
      });
    }
  };

  return (
    <section className="bg-white/90 backdrop-blur-md border border-earth-rust/15 shadow-xs rounded-3xl overflow-hidden transition-all">
      <div className="px-6 py-5 border-b border-earth-rust/10 bg-earth-beige/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-earth-rust/10 flex items-center justify-center text-earth-rust">
          <UserIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-earth-maroon">Public Profile</h2>
          <p className="text-xs text-earth-maroon/60">Customize how your foodie identity appears.</p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="px-6 py-6 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="shrink-0 relative">
            {previewUrl ? (
              <img
                className="h-24 w-24 object-cover rounded-full shadow-sm ring-4 ring-earth-beige border border-earth-rust/20"
                src={previewUrl}
                alt={`${user.displayName || user.email}'s avatar`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-earth-rust to-earth-rust/80 flex items-center justify-center text-white text-3xl font-bold shadow-sm ring-4 ring-earth-beige">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-earth-beige/60 hover:bg-earth-beige border border-earth-rust/25 rounded-full text-xs font-bold text-earth-maroon transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <EditPencilIcon className="w-3.5 h-3.5 text-earth-rust" />
              Change Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              aria-label="Upload profile photo"
              className="hidden"
            />
            <p className="text-xs text-earth-maroon/70">PNG, JPG or WebP · Up to 2MB</p>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-1.5 max-w-md">
          <label htmlFor="display-name" className="block text-xs font-bold text-earth-maroon/80">
            Display Name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="block w-full border border-earth-rust/20 rounded-2xl shadow-2xs py-2.5 px-3.5 text-sm text-earth-maroon placeholder:text-earth-maroon/55 focus:outline-none focus:ring-2 focus:ring-earth-rust/30 focus:border-earth-rust bg-white transition-all"
            placeholder="e.g. Boba Enthusiast"
          />
        </div>

        {/* Read-only Email */}
        <div className="space-y-1.5 max-w-md">
          <label htmlFor="email-address" className="block text-xs font-bold text-earth-maroon/80">
            Email Address
          </label>
          <input
            id="email-address"
            type="email"
            disabled
            value={user.email}
            className="block w-full border border-earth-rust/10 bg-earth-beige/30 rounded-2xl py-2.5 px-3.5 text-sm text-earth-maroon/60 cursor-not-allowed select-none"
          />
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
            className="inline-flex items-center gap-2 justify-center py-2.5 px-6 shadow-xs text-xs font-bold rounded-full text-white bg-earth-rust hover:bg-earth-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-rust disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {status.loading ? (
              <>
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
