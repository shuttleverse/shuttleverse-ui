import React from "react";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationStatusProps {
  isVerified: boolean;
  isPending?: boolean;
  onRequestVerification?: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  isVerified,
  isPending = false,
  onRequestVerification,
}) => {
  if (isVerified) {
    return (
      <div className="badge-verified">
        <Check className="w-3 h-3" />
        <span>Verified Information</span>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="badge-pending">
        <Clock className="w-3 h-3" />
        <span>Verification Pending</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="badge-unverified">
        <span>Unverified</span>
      </div>
      {onRequestVerification && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-6"
          onClick={onRequestVerification}
        >
          Request Verification
        </Button>
      )}
    </div>
  );
};

export default VerificationStatus;
