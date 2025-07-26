import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityForm } from "@/components/forms/entity-form";
import {
  ScheduleCalendar,
  type ScheduleData,
} from "@/components/forms/schedule-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import AuthPrompt from "./auth-prompt";

interface AddInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "court" | "coach" | "stringer";
  entityId: string;
  onAddSchedule?: (scheduleData: ScheduleData[]) => Promise<void>;
  onAddPrice?: (priceData: any[]) => Promise<void>;
  defaultTab?: "schedule" | "pricing";
}

export function AddInfoModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  onAddSchedule,
  onAddPrice,
  defaultTab = "schedule",
}: AddInfoModalProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update active tab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const scheduleForm = useForm<{ schedules: ScheduleData[] }>({
    defaultValues: {
      schedules: [],
    },
  });

  const priceForm = useForm<{ prices: any[] }>({
    defaultValues: {
      prices:
        entityType === "stringer"
          ? [{ price: 0, stringName: "" }]
          : [{ price: 0, duration: 0 }],
    },
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control: priceForm.control,
    name: "prices",
  });

  const addPrice = () => {
    if (entityType === "stringer") {
      appendPrice({ price: 0, stringName: "" });
    } else {
      appendPrice({ price: 0, duration: 0 });
    }
  };

  const handleScheduleSubmit = async (data: { schedules: ScheduleData[] }) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!onAddSchedule) return;

    setIsSubmitting(true);
    try {
      await onAddSchedule(data.schedules);
      scheduleForm.reset();
      onClose();
    } catch (error) {
      console.error("Failed to add schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceSubmit = async (data: { prices: any[] }) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!onAddPrice) return;

    setIsSubmitting(true);
    try {
      await onAddPrice(data.prices);
      priceForm.reset();
      onClose();
    } catch (error) {
      console.error("Failed to add price:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEntityTitle = () => {
    switch (entityType) {
      case "court":
        return "Court";
      case "coach":
        return "Coach";
      case "stringer":
        return "Stringer";
      default:
        return "Entity";
    }
  };

  if (showAuthPrompt) {
    return (
      <AuthPrompt
        title="Sign in to Add Information"
        description="You need to be signed in to add information to this entity."
        action="Sign in to continue"
        onClose={() => setShowAuthPrompt(false)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Information to {getEntityTitle()}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...scheduleForm}>
                  <form
                    onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={scheduleForm.control}
                      name="schedules"
                      render={({ field: { value, onChange } }) => (
                        <FormItem>
                          <ScheduleCalendar
                            schedules={value}
                            onChange={onChange}
                            entityType={entityType}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Schedule"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Add Pricing</CardTitle>
                  <Button
                    type="button"
                    onClick={addPrice}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Price
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...priceForm}>
                  <form
                    onSubmit={priceForm.handleSubmit(handlePriceSubmit)}
                    className="space-y-4"
                  >
                    {priceFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {entityType === "stringer" ? (
                          <FormField
                            control={priceForm.control}
                            name={`prices.${index}.stringName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>String</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={
                                      index === 0 ? "" : "e.g. Yonex BG65"
                                    }
                                    {...field}
                                    value={
                                      index === 0 ? "Service Fee" : field.value
                                    }
                                    disabled={index === 0}
                                    required
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={priceForm.control}
                            name={`prices.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={Math.floor(
                                          field.value / 60
                                        ).toString()}
                                        onValueChange={(value) => {
                                          const hours = Number(value);
                                          const minutes = field.value % 60;
                                          field.onChange(hours * 60 + minutes);
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="Hours" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 9 }, (_, i) => (
                                            <SelectItem
                                              key={i}
                                              value={i.toString()}
                                            >
                                              {i}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <span className="text-sm text-muted-foreground">
                                        hours
                                      </span>
                                    </div>
                                  </FormControl>
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={(field.value % 60).toString()}
                                        onValueChange={(value) => {
                                          const minutes = Number(value);
                                          const hours = Math.floor(
                                            field.value / 60
                                          );
                                          field.onChange(hours * 60 + minutes);
                                        }}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue placeholder="Minutes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from(
                                            { length: 60 },
                                            (_, i) => (
                                              <SelectItem
                                                key={i}
                                                value={i.toString()}
                                              >
                                                {i.toString().padStart(2, "0")}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <span className="text-sm text-muted-foreground">
                                        minutes
                                      </span>
                                    </div>
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={priceForm.control}
                          name={`prices.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? 0 : Number(value)
                                    );
                                  }}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {priceFields.length > 1 &&
                          (entityType !== "stringer" || index !== 0) && (
                            <div className="flex justify-end md:col-span-2">
                              <Button
                                type="button"
                                onClick={() => removePrice(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Price
                              </Button>
                            </div>
                          )}
                      </div>
                    ))}
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Pricing"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
