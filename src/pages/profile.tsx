import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/services/user";
import { useUserOwnershipClaims } from "@/services/ownership-claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Save, X, Shield, File, Calendar } from "lucide-react";
import { toast } from "@/components/ui/sonner-utils";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { getEntityColor } from "@/lib/colors";

const Profile = () => {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const navigate = useNavigate();
  const ownershipClaims = useUserOwnershipClaims();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
  });
  const isMobile = useIsMobile();

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
                {user.admin && (
                  <div className="pt-6 border-t border-gray-100">
                    <Button
                      onClick={() => navigate("/admin")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </div>
                )}
                {isMobile && (
                  <Button
                    onClick={() => logout.mutate()}
                    variant="outline"
                    className="flex-1"
                  >
                    Logout
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto mt-8">
            <Card className="bg-gradient-to-br from-emerald-100/90 via-teal-100/80 to-cyan-100/70 backdrop-blur-md border border-emerald-300/60 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-emerald-600" />
                  <CardTitle className="text-2xl font-bold text-emerald-800">
                    Ownership Claims
                  </CardTitle>
                </div>
                <p className="text-emerald-700">
                  Track your submitted ownership claims
                </p>
              </CardHeader>
              <CardContent>
                {ownershipClaims.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-emerald-700">Loading claims...</p>
                  </div>
                ) : ownershipClaims.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">
                      Failed to load ownership claims
                    </p>
                    <Button
                      onClick={() => ownershipClaims.refetch()}
                      variant="outline"
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : !ownershipClaims.data ||
                  ownershipClaims.data.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      No ownership claims yet
                    </p>
                    <p className="text-sm text-gray-500">
                      Submit ownership claims for courts, coaches, or stringers
                      you own
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownershipClaims.data.map((claim) => (
                      <div
                        key={claim.id}
                        className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: getEntityColor(
                                    claim.entityType.toLowerCase(),
                                    "solid"
                                  ),
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                {claim.entityType}
                              </Badge>
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor:
                                    claim.status === "APPROVED"
                                      ? "#10b981"
                                      : claim.status === "REJECTED"
                                      ? "#ef4444"
                                      : "#6b7280",
                                  color: "white",
                                  border: "none",
                                }}
                              >
                                {claim.status || "PENDING"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Submitted on{" "}
                                {new Date(claim.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {claim.userNotes && (
                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Notes:</strong> {claim.userNotes}
                              </p>
                            )}
                            {claim.files && claim.files.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <File className="h-4 w-4" />
                                <span>
                                  {claim.files.length} file(s) uploaded
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              const entityType = claim.entityType.toLowerCase();
                              navigate(`/${entityType}s/${claim.entityId}`);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            View Entity
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="h-64"></div>
        </div>
      </div>
      <Footer />
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Profile;
