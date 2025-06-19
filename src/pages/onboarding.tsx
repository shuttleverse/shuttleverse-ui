import React, { useState, useEffect } from "react";
import { useUpdateProfile, useUserProfile } from "@/services/user";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner-utils";

const Onboarding = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const updateProfile = useUpdateProfile();
  const { refetch: refetchProfile } = useUserProfile(true);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ username, bio }).then(() => {
        refetchProfile();
        setTimeout(() => {
          navigate("/home");
        }, 100);
      });
    } catch (error) {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-emerald-900">
          Complete Your Profile
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              placeholder="Tell us about yourself"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-700 text-white font-semibold py-2 rounded-md hover:bg-emerald-800 transition"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
