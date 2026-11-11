import React, { useState, useRef, useEffect } from 'react';
import useUserStore from '../store/useUserStore';
import apiClient from '../api/axios';
import Layout from '../components/KymLayout';
import { UserIcon, KeyIcon, EditPencilIcon, CheckIcon, SpinnerIcon } from '../components/icons/UiIcons';

const ProfilePage = () => {
  const { user, setUser } = useUserStore();

  // --- Profile State ---
  const [displayName, setDisplayName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [profileStatus, setProfileStatus] = useState({ loading: false, error: null, success: null });
  const fileInputRef = useRef(null);

  // --- Password State ---
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: null, success: null });

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPreviewUrl(user.profileImageUrl || '');
    }
  }, [user]);

  // Clean up blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- Handlers ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ loading: true, error: null, success: null });

    try {
      const formData = new FormData();
      formData.append('DisplayName', displayName);
      if (profileImage) {
        formData.append('ProfileImage', profileImage);
      }

      const response = await apiClient.put('/Users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setProfileStatus({ loading: false, error: null, success: 'Profile updated successfully!' });
    } catch (error) {
      setProfileStatus({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to update profile.', 
        success: null 
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: false, error: null, success: null });

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordStatus({ loading: false, error: 'New passwords do not match.', success: null });
    }

    setPasswordStatus({ loading: true, error: null, success: null });

    try {
      await apiClient.post('/Auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      setPasswordStatus({ loading: false, error: null, success: 'Password changed successfully!' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' }); 
    } catch (error) {
      setPasswordStatus({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to change password.', 
        success: null 
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-16 text-center text-earth-maroon">
          <SpinnerIcon className="w-8 h-8 text-earth-rust mb-3 animate-spin" />
          <p className="font-semibold text-sm text-earth-maroon/70">Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full space-y-8 animate-fade-in">
        {/* Page Title */}
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-earth-maroon tracking-tight font-display">Account Settings</h1>
          <p className="text-sm text-earth-maroon/70 mt-1">
            Personalize your culinary profile and manage security settings.
          </p>
        </div>

        <div className="space-y-8">
          {/* ================= PROFILE SECTION ================= */}
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
              {profileStatus.error && (
                <div role="alert" className="text-red-700 font-medium text-xs bg-red-50/90 border border-red-200/70 p-3 rounded-2xl max-w-md">
                  {profileStatus.error}
                </div>
              )}
              {profileStatus.success && (
                <div role="status" className="flex items-center gap-2 text-earth-green font-bold text-xs bg-earth-green/10 border border-earth-green/20 p-3 rounded-2xl max-w-md">
                  <CheckIcon className="w-4 h-4 text-earth-green" />
                  {profileStatus.success}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileStatus.loading}
                  className="inline-flex items-center gap-2 justify-center py-2.5 px-6 shadow-xs text-xs font-bold rounded-full text-white bg-earth-rust hover:bg-earth-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-rust disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {profileStatus.loading ? (
                    <>
                      <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ================= PASSWORD SECTION ================= */}
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
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="block w-full border border-earth-rust/20 rounded-2xl shadow-2xs py-2.5 px-3.5 text-sm text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust/30 focus:border-earth-rust bg-white transition-all"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              {/* Status Messages */}
              {passwordStatus.error && (
                <div role="alert" className="text-red-700 font-medium text-xs bg-red-50/90 border border-red-200/70 p-3 rounded-2xl max-w-md">
                  {passwordStatus.error}
                </div>
              )}
              {passwordStatus.success && (
                <div role="status" className="flex items-center gap-2 text-earth-green font-bold text-xs bg-earth-green/10 border border-earth-green/20 p-3 rounded-2xl max-w-md">
                  <CheckIcon className="w-4 h-4 text-earth-green" />
                  {passwordStatus.success}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="inline-flex items-center gap-2 justify-center py-2.5 px-6 shadow-xs text-xs font-bold rounded-full text-white bg-earth-green hover:bg-earth-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-green disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {passwordStatus.loading ? (
                    <>
                      <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
