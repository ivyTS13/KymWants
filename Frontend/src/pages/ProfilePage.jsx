import React, { useState, useRef, useEffect } from 'react';
import useUserStore from '../store/useUserStore';
import apiClient from '../api/axios';
import Layout from '../components/KymLayout';

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

  if (!user) return <div className="p-8 text-center text-earth-maroon font-semibold">Loading profile...</div>;

  return (
    <Layout>
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-earth-green mb-8 tracking-wide">Account Settings</h1>

      <div className="space-y-8">
        {/* ================= PROFILE SECTION ================= */}
        <section className="bg-white border border-earth-rust/30 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-earth-rust/20 bg-earth-beige/20">
            <h2 className="text-xl font-bold text-earth-maroon">Public Profile</h2>
            <p className="mt-1 text-base text-earth-maroon/70">Update your display name and profile photo.</p>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="px-6 py-6 space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {previewUrl ? (
                  <img 
                    className="h-24 w-24 object-cover rounded-full shadow-sm border-2 border-earth-rust/50" 
                    src={previewUrl} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-earth-rust flex items-center justify-center text-earth-beige text-3xl font-bold shadow-sm">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-earth-beige/50 border border-earth-rust/40 rounded-md shadow-sm text-base font-semibold text-earth-maroon hover:bg-earth-rust hover:text-earth-beige focus:outline-none transition-colors"
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="mt-2 text-xs text-earth-maroon/60">JPG, GIF or PNG. Max 2MB.</p>
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-base font-bold text-earth-maroon">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full md:w-1/2 border border-earth-rust/40 rounded-md shadow-sm py-2 px-3 text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust focus:border-transparent sm:text-base bg-white transition-shadow"
                placeholder="Enter your display name"
              />
            </div>
            
            {/* Read-only Email */}
            <div>
              <label className="block text-base font-bold text-earth-maroon">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="mt-1 block w-full md:w-1/2 border border-earth-rust/20 bg-earth-beige/40 rounded-md shadow-sm py-2 px-3 text-earth-maroon/60 sm:text-base cursor-not-allowed"
              />
            </div>

            {/* Profile Status Messages */}
            {profileStatus.error && <p className="text-red-600 font-medium text-base bg-red-50 p-2 rounded">{profileStatus.error}</p>}
            {profileStatus.success && <p className="text-earth-green font-bold text-base bg-earth-green/10 p-2 rounded">{profileStatus.success}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={profileStatus.loading}
                className="inline-flex justify-center py-2 px-6 shadow-sm text-base font-bold rounded-md text-earth-beige bg-earth-rust hover:bg-earth-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-earth-maroon disabled:opacity-50 transition-colors"
              >
                {profileStatus.loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ================= PASSWORD SECTION ================= */}
        <section className="bg-white border border-earth-rust/30 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-earth-rust/20 bg-earth-beige/20">
            <h2 className="text-xl font-bold text-earth-maroon">Change Password</h2>
            <p className="mt-1 text-base text-earth-maroon/70">Ensure your account is using a long, random password to stay secure.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-earth-maroon">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  className="mt-1 block w-full border border-earth-rust/40 rounded-md shadow-sm py-2 px-3 text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust focus:border-transparent sm:text-base transition-shadow"
                />
              </div>
              <div className="col-span-2 hidden md:block"></div> {/* Spacer */}

              <div>
                <label className="block text-base font-bold text-earth-maroon">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="mt-1 block w-full border border-earth-rust/40 rounded-md shadow-sm py-2 px-3 text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust focus:border-transparent sm:text-base transition-shadow"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-earth-maroon">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="mt-1 block w-full border border-earth-rust/40 rounded-md shadow-sm py-2 px-3 text-earth-maroon focus:outline-none focus:ring-2 focus:ring-earth-rust focus:border-transparent sm:text-base transition-shadow"
                />
              </div>
            </div>

            {/* Password Status Messages */}
            {passwordStatus.error && <p className="text-red-600 font-medium text-base bg-red-50 p-2 rounded">{passwordStatus.error}</p>}
            {passwordStatus.success && <p className="text-earth-green font-bold text-base bg-earth-green/10 p-2 rounded">{passwordStatus.success}</p>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={passwordStatus.loading}
                className="inline-flex justify-center py-2 px-6 shadow-sm text-base font-bold rounded-md text-earth-beige bg-earth-green hover:bg-earth-green/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-earth-green disabled:opacity-50 transition-colors"
              >
                {passwordStatus.loading ? 'Updating...' : 'Update Password'}
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