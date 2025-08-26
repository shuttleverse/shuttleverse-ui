import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  OwnershipClaimData,
  useAllOwnershipClaims,
  useUpdateOwnershipClaimStatus,
} from "@/services/ownership-claims";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  File,
  Calendar,
  User,
  Check,
  X,
  Eye,
  Download,
  Play,
  Image,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/sonner-utils";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { getEntityColor } from "@/lib/colors";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedClaim, setSelectedClaim] = useState<OwnershipClaimData | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileUrl: string;
  } | null>(null);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);

  const ownershipClaims = useAllOwnershipClaims(currentPage, 10);
  const updateStatus = useUpdateOwnershipClaimStatus();

  if (user && !user.admin) {
    navigate("/");
    return null;
  }

  const handleApprove = async (claimId: string) => {
    try {
      await updateStatus.mutateAsync({ claimId, status: "APPROVED" });
      toast.success("Claim approved successfully!");
      ownershipClaims.refetch();
    } catch (error) {
      toast.error("Failed to approve claim. Please try again.");
    }
  };

  const handleReject = async (claimId: string) => {
    try {
      await updateStatus.mutateAsync({ claimId, status: "REJECTED" });
      toast.success("Claim rejected successfully!");
      ownershipClaims.refetch();
    } catch (error) {
      toast.error("Failed to reject claim. Please try again.");
    }
  };

  const handleViewClaim = (claim: OwnershipClaimData) => {
    setSelectedClaim(claim);
    setIsViewDialogOpen(true);
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return "image";
    } else if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension || "")
    ) {
      return "video";
    } else if (["pdf"].includes(extension || "")) {
      return "pdf";
    } else if (["doc", "docx"].includes(extension || "")) {
      return "document";
    } else {
      return "other";
    }
  };

  const getMimeType = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    const mimeTypes: { [key: string]: string } = {
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
      webm: "video/webm",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
    };
    return mimeTypes[extension || ""] || "application/octet-stream";
  };

  const getFileIcon = (fileName: string) => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Play className="h-5 w-5 text-red-500" />;
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600" />;
      case "document":
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handlePreviewFile = (file: { fileName: string; fileUrl: string }) => {
    setSelectedFile(file);
    setIsFilePreviewOpen(true);
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-indigo/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-indigo mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      <div className="pt-24 pb-8 px-4 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-800 mb-3">
              Admin Dashboard
            </h1>
            <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
              Manage ownership claims and review submitted documents
            </p>
          </div>

          <Card className="bg-gradient-to-br from-emerald-100/90 via-teal-100/80 to-cyan-100/70 backdrop-blur-md border border-emerald-300/60 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Shield className="h-6 w-6 text-emerald-600" />
                <CardTitle className="text-2xl font-bold text-emerald-800">
                  Ownership Claims
                </CardTitle>
              </div>
              <p className="text-emerald-700">
                Review and manage pending ownership claims
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
              ) : !ownershipClaims.data?.content ||
                ownershipClaims.data.content.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    No ownership claims found
                  </p>
                  <p className="text-sm text-gray-500">
                    All claims have been processed or there are no pending
                    claims
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownershipClaims.data.content.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-emerald-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-emerald-100 text-emerald-800 text-sm">
                                {claim.creator?.username?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {claim.creator?.username || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {claim.creator?.email || "No email"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
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

                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Submitted on{" "}
                              {new Date(claim.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {claim.userNotes && (
                            <p className="text-sm text-gray-700 mb-3">
                              <strong>Notes:</strong> {claim.userNotes}
                            </p>
                          )}

                          {claim.files && claim.files.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <File className="h-4 w-4" />
                              <span>{claim.files.length} file(s) uploaded</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => handleViewClaim(claim)}
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>

                          {claim.status === "PENDING" && (
                            <>
                              <Button
                                onClick={() => handleApprove(claim.id)}
                                disabled={updateStatus.isPending}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(claim.id)}
                                disabled={updateStatus.isPending}
                                variant="destructive"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {ownershipClaims.data &&
                    ownershipClaims.data.totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          onClick={() =>
                            setCurrentPage(Math.max(0, currentPage - 1))
                          }
                          disabled={currentPage === 0}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm text-gray-600">
                          Page {currentPage + 1} of{" "}
                          {ownershipClaims.data.totalPages}
                        </span>
                        <Button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={
                            currentPage >= ownershipClaims.data.totalPages - 1
                          }
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ownership Claim Details
            </DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Claimant Information
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-800">
                      {selectedClaim.creator?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedClaim.creator?.username || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedClaim.creator?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Claim Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Entity Type:
                    </span>
                    <Badge
                      className="ml-2"
                      style={{
                        backgroundColor: getEntityColor(
                          selectedClaim.entityType.toLowerCase(),
                          "solid"
                        ),
                        color: "white",
                        border: "none",
                      }}
                    >
                      {selectedClaim.entityType}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <Badge
                      className="ml-2"
                      style={{
                        backgroundColor:
                          selectedClaim.status === "APPROVED"
                            ? "#10b981"
                            : selectedClaim.status === "REJECTED"
                            ? "#ef4444"
                            : "#6b7280",
                        color: "white",
                        border: "none",
                      }}
                    >
                      {selectedClaim.status || "PENDING"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Submitted:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {new Date(selectedClaim.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Entity ID:
                    </span>
                    <span className="ml-2 text-gray-600 font-mono">
                      {selectedClaim.entityId}
                    </span>
                  </div>
                </div>

                {selectedClaim.userNotes && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">
                      User Notes:
                    </span>
                    <p className="mt-1 text-gray-600 bg-white p-3 rounded border">
                      {selectedClaim.userNotes}
                    </p>
                  </div>
                )}
              </div>

              {selectedClaim.files && selectedClaim.files.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Submitted Files
                  </h3>
                  <div className="space-y-3">
                    {selectedClaim.files.map(
                      (file: {
                        id: string;
                        fileName: string;
                        fileUrl: string;
                      }) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-white p-3 rounded border"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.fileName)}
                            <span className="text-sm font-medium text-gray-900">
                              {file.fileName}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {getFileType(file.fileName) !== "other" && (
                              <Button
                                onClick={() => handlePreviewFile(file)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                            )}
                            <Button
                              onClick={() =>
                                handleDownloadFile(file.fileUrl, file.fileName)
                              }
                              variant="outline"
                              size="sm"
                              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedClaim.status === "PENDING" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedClaim.id);
                      setIsViewDialogOpen(false);
                    }}
                    disabled={updateStatus.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Claim
                  </Button>
                  <Button
                    onClick={() => {
                      handleReject(selectedClaim.id);
                      setIsViewDialogOpen(false);
                    }}
                    disabled={updateStatus.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Claim
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFilePreviewOpen} onOpenChange={setIsFilePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFile && getFileIcon(selectedFile.fileName)}
              File Preview: {selectedFile?.fileName}
            </DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-4">
              {getFileType(selectedFile.fileName) === "image" && (
                <div className="flex justify-center">
                  <img
                    src={selectedFile.fileUrl}
                    alt={selectedFile.fileName}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg border"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.display = "none";
                      const nextSibling =
                        target.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.style.display = "block";
                      }
                    }}
                  />
                  <div className="hidden text-center text-gray-500 p-8">
                    <File className="h-12 w-12 mx-auto mb-2" />
                    <p>Image could not be loaded</p>
                    <p className="text-sm">
                      The file may be corrupted or in an unsupported format
                    </p>
                  </div>
                </div>
              )}

              {getFileType(selectedFile.fileName) === "video" && (
                <div className="flex justify-center">
                  <video
                    controls
                    className="max-w-full max-h-[60vh] rounded-lg border"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.display = "none";
                      const nextSibling =
                        target.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.style.display = "block";
                      }
                    }}
                  >
                    <source src={selectedFile.fileUrl} />
                    Your browser does not support the video tag.
                  </video>
                  <div className="hidden text-center text-gray-500 p-8">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p>Video could not be loaded</p>
                    <p className="text-sm">
                      The file may be corrupted, in an unsupported format, or
                      blocked by CORS policy
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-gray-400">
                        File URL: {selectedFile.fileUrl}
                      </p>
                      <p className="text-xs text-gray-400">
                        Detected MIME Type: {getMimeType(selectedFile.fileName)}
                      </p>
                      <p className="text-xs text-gray-400">
                        File Extension: {selectedFile.fileName.split(".").pop()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {getFileType(selectedFile.fileName) === "pdf" && (
                <div className="flex justify-center">
                  <iframe
                    src={`${selectedFile.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-[60vh] border rounded-lg"
                    title={selectedFile.fileName}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.display = "none";
                      const nextSibling =
                        target.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.style.display = "block";
                      }
                    }}
                  />
                  <div className="hidden text-center text-gray-500 p-8">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p>PDF could not be loaded</p>
                    <p className="text-sm">
                      The file may be corrupted or the browser doesn't support
                      PDF preview
                    </p>
                  </div>
                </div>
              )}

              {getFileType(selectedFile.fileName) === "document" && (
                <div className="text-center text-gray-500 p-8">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>Document preview not available</p>
                  <p className="text-sm mb-4">
                    Word documents cannot be previewed in the browser
                  </p>
                  <Button
                    onClick={() =>
                      handleDownloadFile(
                        selectedFile.fileUrl,
                        selectedFile.fileName
                      )
                    }
                    variant="outline"
                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}

              {getFileType(selectedFile.fileName) === "other" && (
                <div className="text-center text-gray-500 p-8">
                  <File className="h-12 w-12 mx-auto mb-2" />
                  <p>Preview not available</p>
                  <p className="text-sm mb-4">
                    This file type cannot be previewed in the browser
                  </p>
                  <Button
                    onClick={() =>
                      handleDownloadFile(
                        selectedFile.fileUrl,
                        selectedFile.fileName
                      )
                    }
                    variant="outline"
                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>File:</strong> {selectedFile.fileName}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {getFileType(selectedFile.fileName).toUpperCase()}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    handleDownloadFile(
                      selectedFile.fileUrl,
                      selectedFile.fileName
                    )
                  }
                  variant="outline"
                  className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Admin;
