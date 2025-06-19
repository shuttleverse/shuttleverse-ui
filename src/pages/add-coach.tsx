import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateCoach,
  useAddCoachSchedule,
  useAddCoachPrice,
} from "@/services/coaches";
import { EntityForm } from "@/components/forms/entity-form";
import Layout from "@/components/layout/layout";
import type { CoachFormData } from "@/services/coaches";

const requiredFields = {
  name: true,
  location: false,
  longitude: false,
  latitude: false,
  description: false,
  website: false,
  phoneNumber: false,
  schedules: true,
  prices: true,
  otherContacts: true,
};

export default function AddCoach() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createCoach = useCreateCoach();
  const addSchedule = useAddCoachSchedule();
  const addPrice = useAddCoachPrice();

  const handleSubmit = async (formData: CoachFormData) => {
    try {
      const { schedules, prices } = formData;
      const { data: coach } = await createCoach.mutateAsync(formData);

      if (schedules.length > 0) {
        await addSchedule.mutateAsync({
          coachId: coach.id,
          scheduleData: schedules,
        });
      }

      if (prices.length > 0) {
        await addPrice.mutateAsync({
          coachId: coach.id,
          priceData: prices,
        });
      }

      toast({
        title: "Success",
        description: "Coach added successfully",
      });

      navigate("/coaches");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add coach",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <EntityForm
          entityType="coach"
          onSubmit={handleSubmit}
          isSubmitting={createCoach.isPending}
          requiredFields={requiredFields}
        />
      </div>
    </Layout>
  );
}
