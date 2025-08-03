import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";

type CoachCourtPriceData = {
  price: number;
  duration: number;
};

type StringerPriceData = {
  price: number;
  stringName: string;
};

type PriceData = CoachCourtPriceData | StringerPriceData;

interface AddInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "court" | "coach" | "stringer";
  entityId: string;
  onAddSchedule?: (scheduleData: ScheduleData[]) => Promise<void>;
  onAddPrice?: (priceData: PriceData[]) => Promise<void>;
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
  const { isAuthenticated, user } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState(
    entityType === "stringer" ? "pricing" : defaultTab
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    type: "schedule" | "pricing";
    data: ScheduleData[] | PriceData[];
  } | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setActiveTab(entityType === "stringer" ? "pricing" : defaultTab);
  }, [defaultTab, entityType]);

  const scheduleForm = useForm<{ schedules: ScheduleData[] }>({
    defaultValues: {
      schedules: [],
    },
  });

  const priceForm = useForm<{ prices: PriceData[] }>({
    defaultValues: {
      prices: [],
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
    if (!isAuthenticated || !user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!onAddSchedule) return;

    setConfirmationData({ type: "schedule", data: data.schedules });
    setShowConfirmation(true);
  };

  const handlePriceSubmit = async (data: { prices: PriceData[] }) => {
    if (!isAuthenticated || !user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!onAddPrice) return;

    setConfirmationData({ type: "pricing", data: data.prices });
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!confirmationData) return;

    setIsSubmitting(true);
    try {
      if (confirmationData.type === "schedule" && onAddSchedule) {
        await onAddSchedule(confirmationData.data as ScheduleData[]);
        scheduleForm.reset();
      } else if (confirmationData.type === "pricing" && onAddPrice) {
        await onAddPrice(confirmationData.data as PriceData[]);
        priceForm.reset();
      }
      setShowConfirmation(false);
      setConfirmationData(null);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
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
    return <AuthPrompt onClose={() => setShowAuthPrompt(false)} />;
  }

  if (showConfirmation && confirmationData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Confirm{" "}
              {confirmationData.type === "schedule" ? "Schedule" : "Pricing"}{" "}
              Information
            </DialogTitle>
            <DialogDescription>
              Please review the{" "}
              {confirmationData.type === "schedule" ? "schedule" : "pricing"}{" "}
              information before adding it to the{" "}
              {getEntityTitle().toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {confirmationData.type === "schedule" ? (
              <div className="space-y-3">
                {(confirmationData.data as ScheduleData[]).map(
                  (schedule, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          {
                            [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ][schedule.dayOfWeek - 1]
                          }
                        </span>
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                          {"startTime" in schedule
                            ? `${schedule.startTime} - ${schedule.endTime}`
                            : `${schedule.openTime} - ${schedule.closeTime}`}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(confirmationData.data as PriceData[]).map((price, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {entityType === "stringer" && "stringName" in price
                            ? price.stringName
                            : `$${price.price}${
                                "duration" in price && price.duration > 0
                                  ? ` / ${price.duration} minutes`
                                  : ""
                              }`}
                        </span>
                        {entityType !== "stringer" &&
                          "duration" in price &&
                          price.duration > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Duration: {price.duration} minutes
                            </p>
                          )}
                      </div>
                      {entityType === "stringer" && "stringName" in price && (
                        <span className="text-lg font-bold text-green-600 bg-white px-4 py-2 rounded-lg">
                          ${price.price}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Back to Edit
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting
                ? "Adding..."
                : `Add ${
                    confirmationData.type === "schedule"
                      ? "Schedule"
                      : "Pricing"
                  }`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Information to {getEntityTitle()}</DialogTitle>
          <DialogDescription>
            Add details about the {getEntityTitle().toLowerCase()} to help users
            find and book them.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "schedule" | "pricing")
          }
          className="w-full"
        >
          <TabsList
            className={`grid w-full ${
              entityType === "stringer" ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {entityType !== "stringer" && (
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            )}
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          {entityType !== "stringer" && (
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
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                        >
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
          )}

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
                                    placeholder="e.g. Yonex BG65"
                                    {...field}
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
