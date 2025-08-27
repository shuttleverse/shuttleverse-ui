import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateCourt,
  useAddCourtSchedule,
  useAddCourtPrice,
  type CourtFormData,
} from "@/services/courts";
import { EntityForm } from "@/components/forms/entity-form";
import Navbar from "@/components/layout/navbar";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const requiredFields = {
  name: true,
  location: true,
  longitude: true,
  latitude: true,
  description: false,
  website: false,
  phoneNumber: false,
  schedules: true,
  prices: true,
  otherContacts: false,
  experienceYears: false,
};

export default function AddCourt() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createCourt = useCreateCourt();
  const addCourtSchedule = useAddCourtSchedule();
  const addCourtPrice = useAddCourtPrice();
  const isMobile = useIsMobile();
  
  const handleSubmit = async (formData: CourtFormData) => {
    try {
      const { schedules, prices } = formData;
      const { data: court } = await createCourt.mutateAsync(formData);

      if (schedules && schedules.length > 0) {
        await addCourtSchedule.mutateAsync({
          courtId: court.id,
          scheduleData: schedules,
        });
      }

      if (prices && prices.length > 0) {
        await addCourtPrice.mutateAsync({
          courtId: court.id,
          priceData: prices,
        });
      }

      toast({
        title: "Success",
        description: "Court added successfully!",
      });
      navigate(`/courts/${court.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add court. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-green-100">
      <Navbar />
      <div className="container mx-auto p-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Register a New Court
            </h1>
          </div>

          <div
            className="bg-white/60 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-xl"
            style={{
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
            }}
          >
            <EntityForm
              entityType="court"
              onSubmit={handleSubmit}
              isSubmitting={createCourt.isPending}
              requiredFields={requiredFields}
            />
          </div>
        </div>
      </div>
      {isMobile && <BottomNavigation />}
    </div>
  );
}
