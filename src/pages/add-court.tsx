import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateCourt,
  useAddCourtSchedule,
  useAddCourtPrice,
  type CourtFormData,
} from "@/services/courts";
import { EntityForm } from "@/components/forms/entity-form";
import Layout from "@/components/layout/layout";

const requiredFields = {
  name: true,
  location: true,
  description: false,
  website: false,
  phoneNumber: false,
  schedules: true,
  prices: true,
  otherContacts: false,
};

export default function AddCourt() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createCourt = useCreateCourt();
  const addCourtSchedule = useAddCourtSchedule();
  const addCourtPrice = useAddCourtPrice();

  const handleSubmit = async (formData: CourtFormData) => {
    try {
      const { schedules, prices, ...courtData } = formData;
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
      navigate("/courts");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add court. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Add New Court</h1>
          <EntityForm
            entityType="court"
            onSubmit={handleSubmit}
            isSubmitting={createCourt.isPending}
            requiredFields={requiredFields}
          />
        </div>
      </div>
    </Layout>
  );
}
