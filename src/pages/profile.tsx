import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Edit, Save, X } from "lucide-react";
import { toast } from "@/components/ui/sonner-utils";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const Profile = () => {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: user?.username || "",
      bio: user?.bio || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || "",
      bio: user?.bio || "",
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        username: formData.username,
        bio: formData.bio,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-indigo/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-indigo mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="pt-24 pb-8 px-4 min-h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-800 mb-3">
              Your Profile
            </h1>
            <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
              Manage your account settings and keep your profile information up
              to date
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-emerald-100/90 via-teal-100/80 to-cyan-100/70 backdrop-blur-md border border-emerald-300/60 shadow-2xl">
              <CardHeader className="text-center pb-6 relative">
                {!isEditing && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100/80 backdrop-blur-sm text-emerald-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <div className="flex justify-center mb-3">
                  <Avatar className="h-28 w-28 border-4 border-white/40 shadow-lg">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-3xl">
                      {user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                  {user.username}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 text-xs text-black">
                  <User className="h-4 w-4" />
                  <span>
                    Member Since{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : new Date().toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="h-0.5 bg-gray-300 my-2"></div>

                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Profile Information
                    </h3>
                  </div>
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="username"
                            className="block text-sm font-semibold text-black"
                          >
                            Username
                          </label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) =>
                              handleInputChange("username", e.target.value)
                            }
                            placeholder="Enter your username"
                            className="w-full border-emerald-400 bg-emerald-50/90 backdrop-blur-sm focus:border-emerald-600 focus:ring-emerald-200 placeholder:text-emerald-700 text-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-black">
                            Email
                          </label>
                          <Input
                            value={user.email}
                            disabled
                            className="w-full border-emerald-300 bg-emerald-100/80 text-gray-700 backdrop-blur-sm"
                          />
                          <p className="text-xs text-black/65">
                            Email cannot be changed
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="bio"
                          className="block text-sm font-semibold text-black"
                        >
                          Biography
                        </label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          maxLength={200}
                          placeholder="Tell us about yourself, your interests, or anything you'd like to share..."
                          rows={4}
                          className="w-full border-emerald-400 bg-emerald-50/90 backdrop-blur-sm focus:border-emerald-600 focus:ring-emerald-200 placeholder:text-emerald-700 text-gray-900 resize-none"
                        />
                        <p className="text-xs text-black/65">
                          Share a bit about yourself to help others get to know
                          you
                        </p>
                      </div>
                      <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <Button
                          onClick={handleSave}
                          disabled={updateProfile.isPending}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateProfile.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-black uppercase tracking-wide">
                            Username
                          </label>
                          <div className="p-3 bg-emerald-50/90 backdrop-blur-sm rounded-lg border border-emerald-300 shadow-sm">
                            <p className="text-gray-900 font-medium">
                              {user.username}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-black uppercase tracking-wide">
                            Email
                          </label>
                          <div className="p-3 bg-emerald-50/90 backdrop-blur-sm rounded-lg border border-emerald-300 shadow-sm">
                            <p className="text-gray-900 font-medium">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-black uppercase tracking-wide">
                          Bio
                        </label>
                        <div className="p-4 bg-emerald-50/90 backdrop-blur-sm rounded-lg border border-emerald-300 shadow-sm min-h-[100px]">
                          <p className="text-gray-900 leading-relaxed">
                            {user.bio || (
                              <span className="text-gray-600 italic">
                                No bio added yet. Click "Edit Profile" to add
                                one.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional spacing to push footer down */}
          <div className="h-64"></div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
