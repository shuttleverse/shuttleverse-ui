import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateStringer,
  useAddStringerSchedule,
  useAddStringerPrice,
} from "@/services/stringers";
import { EntityForm } from "@/components/forms/entity-form";
import Layout from "@/components/layout/layout";
import type { StringerFormData } from "@/services/stringers";

const requiredFields = {
  name: true,
  location: false,
  description: false,
  website: false,
  phoneNumber: false,
  schedules: true,
  prices: true,
  otherContacts: true,
};

export default function AddStringer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createStringer = useCreateStringer();
  const addPrice = useAddStringerPrice();

  const handleSubmit = async (formData: StringerFormData) => {
    try {
      const { prices, ...stringerData } = formData;
      const { data: stringer } = await createStringer.mutateAsync(formData);

      if (prices.length > 0) {
        await addPrice.mutateAsync({
          stringerId: stringer.id,
          priceData: prices,
        });
      }

      toast({
        title: "Success",
        description: "Stringer added successfully",
      });

      navigate("/stringers");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stringer",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <EntityForm
          entityType="stringer"
          onSubmit={handleSubmit}
          isSubmitting={createStringer.isPending}
          requiredFields={requiredFields}
        />
      </div>
    </Layout>
  );
}
