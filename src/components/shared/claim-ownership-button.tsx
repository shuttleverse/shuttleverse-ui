import React from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ClaimOwnershipButtonProps {
  entityType: string;
  entityName: string;
}

const ClaimOwnershipButton: React.FC<ClaimOwnershipButtonProps> = ({
  entityType,
  entityName,
}) => {
  const { toast } = useToast();

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Claim submitted",
      description: "We'll review your request and get back to you soon.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Flag className="h-4 w-4" />
          <span>Claim Ownership</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim ownership of {entityName}</DialogTitle>
          <DialogDescription>
            Submit proof that you are the owner of this {entityType}. Our team
            will review your request and verify your ownership.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitClaim}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proof">Proof of Ownership</Label>
              <Textarea
                id="proof"
                placeholder="Explain how you can prove ownership (business registration, website, social media profiles, etc.)"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Upload Documents (optional)</Label>
              <Input id="file" type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Claim</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimOwnershipButton;
