"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, changePassword } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading, isAuthenticated, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // While AuthProvider's initial /me check is still in flight, avoid
  // flashing "Please Login" for a user who is actually logged in.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="luxury-card p-8 text-center">
          <h1 className="text-3xl font-heading mb-4">Please Login</h1>
          <Link href="/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    try {
      setSavingProfile(true);
      const result = await updateProfile({ name, phone });
      setUser(result.user);
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    try {
      setSavingPassword(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password updated.");
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="container-custom py-16 space-y-8">
      <div className="luxury-card p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-heading">My Profile</h1>
          <button onClick={logout} className="text-sm text-gray-500 underline">
            Logout
          </button>
        </div>

        <div className="mb-8">
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="text-gray-500 text-sm">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          {profileMessage && <p className="text-sm">{profileMessage}</p>}

          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="luxury-card p-8 max-w-2xl">
        <h2 className="text-2xl font-heading mb-4">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          <input
            type="password"
            placeholder="New password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-xl p-3"
          />

          {passwordMessage && <p className="text-sm">{passwordMessage}</p>}

          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="luxury-card p-8 max-w-2xl">
        <Link href="/orders" className="text-lg font-medium underline">
          View My Orders →
        </Link>
      </div>
    </div>
  );
}
