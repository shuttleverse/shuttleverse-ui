import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOwnershipClaim } from "@/services/ownership-claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner-utils";
import { ArrowLeft, Upload, File, X, Shield, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/layout";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { getEntityColor } from "@/lib/colors";
import type { MapEntity } from "@/services/map";

export default function OwnershipClaimPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const createClaim = useCreateOwnershipClaim();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userNotes, setUserNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const entity = location.state?.entity as MapEntity;
  const entityType = location.state?.entityType as
    | "COURT"
    | "COACH"
    | "STRINGER";

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-indigo/5">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-muted-foreground">
              You need to be signed in to claim ownership
            </p>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!entity || !entityType || !id) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-indigo/5">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-muted-foreground">Invalid entity information</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = [...selectedFiles, ...files];

    const errors = validateFiles(newFiles);
    setFileErrors(errors);

    if (errors.length === 0) {
      setSelectedFiles(newFiles);
    } else {
      toast.error(errors[0]);
    }

    event.target.value = "";
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    const errors = validateFiles(newFiles);
    setFileErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateFiles(selectedFiles);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setIsSubmitting(true);

    toast.success(
      "Ownership claim submitted successfully! Processing in the background..."
    );

    const entityTypeLower = entityType.toLowerCase();
    if (entityTypeLower === "coach") {
      navigate(`/coaches/${id}`);
    } else {
      navigate(`/${entityTypeLower}s/${id}`);
    }

    try {
      await createClaim.mutateAsync({
        entityType,
        entityId: id,
        userNotes: userNotes.trim() || undefined,
        files: selectedFiles,
      });

      toast.success("Ownership claim processed successfully!");
    } catch (error) {
      toast.error("Failed to process ownership claim. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "COURT":
        return "Court";
      case "COACH":
        return "Coach";
      case "STRINGER":
        return "Stringer";
      default:
        return type;
    }
  };

  const isVideoFile = (file: File) => {
    return file.type.startsWith("video/");
  };

  const isDocumentFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    return allowedTypes.includes(file.type);
  };

  const getFileSizeInMB = (file: File) => {
    return file.size / (1024 * 1024);
  };

  const validateFiles = (files: File[]) => {
    const errors: string[] = [];

    if (
      entityType === "COURT" ||
      entityType === "COACH" ||
      entityType === "STRINGER"
    ) {
      const videos = files.filter(isVideoFile);
      const documents = files.filter(isDocumentFile);

      if (videos.length === 0) {
        errors.push("A video is required for ownership claims");
      } else if (videos.length > 1) {
        errors.push("Only one video file is allowed");
      } else {
        const video = videos[0];
        if (getFileSizeInMB(video) > 150) {
          errors.push(`${video.name} exceeds 150MB limit for videos`);
        }
        // Note: Video duration validation would need to be done on the server
        // as it requires loading the video file
      }

      if (documents.length > 2) {
        errors.push(
          "Maximum 2 additional documents allowed for ownership claims"
        );
      }

      if (files.length > 3) {
        errors.push(
          "Maximum 3 files allowed for ownership claims (1 video + 2 documents)"
        );
      }

      documents.forEach((file) => {
        if (getFileSizeInMB(file) > 5) {
          errors.push(`${file.name} exceeds 5MB limit for documents`);
        }
      });
    }

    return errors;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="pt-24 pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 text-emerald-700 hover:text-emerald-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-emerald-600" />
                  <h1 className="text-3xl font-bold text-emerald-800">
                    Claim Ownership
                  </h1>
                </div>
                <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
                  Submit proof of ownership for this{" "}
                  {getEntityTypeLabel(entityType).toLowerCase()}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">
                      Entity Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <EntityAvatar
                        id={entity.id}
                        name={entity.name}
                        type={entity.type as "court" | "coach" | "stringer"}
                        size="lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {entity.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="mt-1"
                          style={{
                            backgroundColor: getEntityColor(
                              entity.type,
                              "solid"
                            ),
                            color: "white",
                            border: "none",
                          }}
                        >
                          {getEntityTypeLabel(entityType)}
                        </Badge>
                      </div>
                    </div>

                    {entity.description && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Description
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {entity.description}
                        </p>
                      </div>
                    )}

                    {entity.location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Location
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {entity.location}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">
                      Ownership Claim Form
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="files"
                          className="text-base font-medium"
                        >
                          Proof of Ownership *
                        </Label>
                        <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                          <Upload className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload files that prove your ownership
                          </p>
                          <div className="text-sm text-gray-500 mb-4 space-y-1">
                            <p>
                              <strong>
                                Requirements: 1 video of your{" "}
                                {entityType === "COURT"
                                  ? "court / facility"
                                  : entityType === "COACH"
                                  ? "coaching session"
                                  : "stringing session"}
                              </strong>
                            </p>
                            <p>
                              <strong>Video formats:</strong> MP4, MOV, AVI,
                              etc. (Max 150MB ~1:30 minutes)
                            </p>
                            <p>
                              <strong>Document formats:</strong> PDF, JPG, PNG,
                              DOC, DOCX (Max 5MB each)
                            </p>
                            <p>
                              <strong>Maximum files:</strong> 3 total (1 video +
                              2 documents)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={selectedFiles.length >= 3}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Select Files
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>

                        {selectedFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Selected Files:
                            </Label>
                            <div className="space-y-2">
                              {selectedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    {isVideoFile(file) ? (
                                      <svg
                                        className="h-4 w-4 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                      </svg>
                                    ) : (
                                      <File className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="text-sm text-gray-700">
                                      {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                                      MB)
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {isVideoFile(file) ? "Video" : "Document"}
                                    </Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {fileErrors.length > 0 && (
                          <div className="space-y-2">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700">
                                  File Requirements Not Met
                                </span>
                              </div>
                              <ul className="text-xs text-red-600 space-y-1">
                                {fileErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-amber-800">
                              Security Notice
                            </h4>
                            <p className="text-sm text-amber-700">
                              <strong>
                                Do not upload sensitive information
                              </strong>{" "}
                              such as driver's licenses, government IDs,
                              passports, or other personal identification
                              documents. Please contact us directly at{" "}
                              <a
                                href="mailto:shuttleverse.team@gmail.com"
                                className="text-amber-800 underline hover:text-amber-900"
                              >
                                shuttleverse.team@gmail.com
                              </a>{" "}
                              for handling of sensitive documents.
                            </p>
                            <p className="text-sm text-amber-700">
                              <strong>Note:</strong> Do not send sensitive
                              information through email. We will provide
                              alternatives for document submission.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="notes"
                          className="text-base font-medium"
                        >
                          Additional Notes (Optional)
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Provide any additional information about your ownership claim..."
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            selectedFiles.length === 0 ||
                            fileErrors.length > 0
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Claim"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
