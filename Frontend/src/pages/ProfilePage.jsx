import React from "react";
import useUserStore from "../store/useUserStore";
import Layout from "../components/KymLayout";
import { SpinnerIcon } from "../components/icons/UiIcons";
import PublicProfileSection from "../components/profile/PublicProfileSection";
import PasswordChangeSection from "../components/profile/PasswordChangeSection";

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-16 text-center text-earth-maroon">
          <SpinnerIcon className="w-8 h-8 text-earth-rust mb-3 animate-spin" />
          <p className="font-semibold text-sm text-earth-maroon/70">
            Loading your profile...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full space-y-8 animate-fade-in">
        {/* Page Title */}
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-earth-maroon tracking-tight font-display">
            Account Settings
          </h1>
          <p className="text-sm text-earth-maroon/70 mt-1">
            Personalize your culinary profile and manage security settings.
          </p>
        </div>

        <div className="space-y-8">
          {/* Public Profile Form Section */}
          <PublicProfileSection user={user} onProfileUpdated={setUser} />

          {/* Password & Security Form Section */}
          <PasswordChangeSection />
        </div>
      </div>
    </Layout>
  );
}
