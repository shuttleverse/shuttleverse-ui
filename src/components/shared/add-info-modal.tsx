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
  FormDescription,
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
import { Separator } from "@/components/ui/separator";

type CoachCourtPriceData = {
  minPrice: number;
  maxPrice: number;
  duration: number;
  durationUnit: string;
  description?: string;
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
  const [priceRangeModes, setPriceRangeModes] = useState<
    Record<number, boolean>
  >({});

  const { toast } = useToast();

  useEffect(() => {
    setActiveTab(entityType === "stringer" ? "pricing" : defaultTab);
  }, [defaultTab, entityType]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"]');
        if (dialogContent) {
          window.dispatchEvent(new Event("resize"));
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfirmation]);

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
      appendPrice({
        minPrice: 0,
        maxPrice: 0,
        duration: 0,
        durationUnit: "minutes",
        description: "",
      });
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

    if (entityType !== "stringer") {
      for (let i = 0; i < data.prices.length; i++) {
        const price = data.prices[i];
        if ("durationUnit" in price && price.durationUnit !== "minutes") {
          if (!price.duration || price.duration === 0) {
            priceForm.setError(`prices.${i}.duration`, {
              type: "required",
              message: "Duration cannot be 0",
            });
            return;
          }
        }
      }
    }

    if (entityType !== "stringer") {
      for (let i = 0; i < data.prices.length; i++) {
        const price = data.prices[i];
        if ("durationUnit" in price && price.durationUnit === "minutes") {
          if (!price.duration || price.duration === 0) {
            priceForm.setError(`prices.${i}.duration`, {
              type: "required",
              message: "Duration cannot be 0",
            });
            return;
          }
        }
      }
    }

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
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-100 via-blue-100 to-green-100 backdrop-blur-md border-none transition-all duration-300 ease-in-out"
          style={{
            background:
              "linear-gradient(to bottom right, rgb(243 244 246), rgb(219 234 254), rgb(220 252 231))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
          }}
        >
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
                      className="bg-transparent rounded-lg p-4 border-l-4 border-blue-500 border border-gray-300 shadow-md"
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
                          {schedule.startTime} - {schedule.endTime}
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
                    className="bg-transparent rounded-lg p-4 border-l-4 border-purple-500 border border-gray-300 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {entityType === "stringer" && "stringName" in price
                            ? price.stringName
                            : "minPrice" in price
                            ? `$${price.minPrice}${
                                price.maxPrice > price.minPrice
                                  ? ` - $${price.maxPrice}`
                                  : ""
                              } / ${price.duration} ${price.durationUnit}`
                            : ""}
                        </span>
                        {entityType !== "stringer" &&
                          "description" in price &&
                          price.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {price.description}
                            </p>
                          )}
                      </div>
                      {entityType === "stringer" && "stringName" in price && (
                        <span className="text-lg font-bold text-green-600 bg-white px-4 py-2 rounded-lg border-none">
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
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-100 via-blue-100 to-green-100 backdrop-blur-md border border-white/20 transition-all duration-300 ease-in-out"
        style={{
          background:
            "linear-gradient(to bottom right, rgb(243 244 246), rgb(219 234 254), rgb(220 252 231))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
        }}
      >
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
            <TabsContent value="schedule" className="space-y-4 border-none">
              <Card className="bg-transparent border-none !important shadow-none">
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
            <Card className="bg-transparent border-none !important shadow-none">
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
                      <div key={field.id} className="space-y-4">
                        {index > 0 && (
                          <Separator className="my-6 bg-gray-400" />
                        )}
                        <div className="bg-transparent p-4 rounded-lg border border-gray-300 shadow-md">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-700">
                              {entityType === "stringer"
                                ? index === 0
                                  ? "Service Fee"
                                  : `String Option ${index}`
                                : `Pricing Option ${index + 1}`}
                            </h4>
                          </div>
                          {entityType === "stringer" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <FormField
                                control={priceForm.control}
                                name={`prices.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Price ($)
                                      <span className="text-red-500 ml-1">
                                        *
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="Enter price"
                                        value={
                                          field.value === 0 ? "" : field.value
                                        }
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numValue =
                                            value === "" ? 0 : Number(value);
                                          field.onChange(numValue);
                                        }}
                                        required
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={priceForm.control}
                                  name={`prices.${index}.minPrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        {priceRangeModes[index]
                                          ? "Min Price ($)"
                                          : "Price ($)"}
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          step="1"
                                          value={
                                            field.value === 0 ? "" : field.value
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const numValue =
                                              value === "" ? 0 : Number(value);
                                            field.onChange(numValue);
                                            const maxPriceField =
                                              priceForm.getValues(
                                                `prices.${index}.maxPrice`
                                              );
                                            if (maxPriceField === field.value) {
                                              priceForm.setValue(
                                                `prices.${index}.maxPrice`,
                                                numValue
                                              );
                                            }
                                          }}
                                          required
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {priceRangeModes[index] && (
                                  <FormField
                                    control={priceForm.control}
                                    name={`prices.${index}.maxPrice`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          Max Price ($)
                                          <span className="text-red-500 ml-1">
                                            *
                                          </span>
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                              field.value === 0
                                                ? ""
                                                : field.value
                                            }
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
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const isRangeMode = priceRangeModes[index];

                                    if (!isRangeMode) {
                                      priceForm.setValue(
                                        `prices.${index}.minPrice`,
                                        0
                                      );
                                      priceForm.setValue(
                                        `prices.${index}.maxPrice`,
                                        0
                                      );
                                      setPriceRangeModes((prev) => ({
                                        ...prev,
                                        [index]: true,
                                      }));
                                    } else {
                                      priceForm.setValue(
                                        `prices.${index}.minPrice`,
                                        0
                                      );
                                      priceForm.setValue(
                                        `prices.${index}.maxPrice`,
                                        0
                                      );
                                      setPriceRangeModes((prev) => ({
                                        ...prev,
                                        [index]: false,
                                      }));
                                    }
                                  }}
                                  className="text-xs"
                                >
                                  {priceRangeModes[index]
                                    ? "Switch to Single Price"
                                    : "Switch to Range"}
                                </Button>
                                {priceRangeModes[index] && (
                                  <span className="text-xs text-muted-foreground">
                                    Range mode
                                  </span>
                                )}
                              </div>
                              <Separator className="my-4 bg-transparent" />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {priceForm.watch(
                                  `prices.${index}.durationUnit`
                                ) === "minutes" ? (
                                  <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                      control={priceForm.control}
                                      name={`prices.${index}.duration`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            Hours
                                            <span className="text-red-500 ml-1">
                                              *
                                            </span>
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={Math.floor(
                                                (field.value || 0) / 60
                                              ).toString()}
                                              onValueChange={(value) => {
                                                const hours =
                                                  Number(value) || 0;
                                                const currentMinutes =
                                                  (field.value || 0) % 60;
                                                const totalMinutes =
                                                  hours * 60 + currentMinutes;
                                                field.onChange(totalMinutes);
                                              }}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {Array.from(
                                                  { length: 13 },
                                                  (_, i) => (
                                                    <SelectItem
                                                      key={i}
                                                      value={i.toString()}
                                                    >
                                                      {i
                                                        .toString()
                                                        .padStart(2, "0")}
                                                    </SelectItem>
                                                  )
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                      rules={{
                                        validate: (value) => {
                                          if (!value || value === 0) {
                                            return "Duration cannot be 0";
                                          }
                                          return true;
                                        },
                                      }}
                                    />
                                    <FormField
                                      control={priceForm.control}
                                      name={`prices.${index}.duration`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>
                                            Minutes
                                            <span className="text-red-500 ml-1">
                                              *
                                            </span>
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={(
                                                (field.value || 0) % 60
                                              ).toString()}
                                              onValueChange={(value) => {
                                                const minutes =
                                                  Number(value) || 0;
                                                const currentHours = Math.floor(
                                                  (field.value || 0) / 60
                                                );
                                                const totalMinutes =
                                                  currentHours * 60 + minutes;
                                                field.onChange(totalMinutes);
                                              }}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {Array.from(
                                                  { length: 61 },
                                                  (_, i) => (
                                                    <SelectItem
                                                      key={i}
                                                      value={i.toString()}
                                                    >
                                                      {i
                                                        .toString()
                                                        .padStart(2, "0")}
                                                    </SelectItem>
                                                  )
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                      rules={{
                                        validate: (value) => {
                                          if (!value || value === 0) {
                                            return "Duration cannot be 0";
                                          }
                                          return true;
                                        },
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className={
                                      priceForm.watch(
                                        `prices.${index}.durationUnit`
                                      ) === "" ||
                                      priceForm.watch(
                                        `prices.${index}.durationUnit`
                                      ) === "other"
                                        ? "grid grid-cols-2 gap-2"
                                        : "w-full"
                                    }
                                  >
                                    <FormField
                                      control={priceForm.control}
                                      name={`prices.${index}.duration`}
                                      render={({ field }) => (
                                        <FormItem
                                          className={
                                            priceForm.watch(
                                              `prices.${index}.durationUnit`
                                            ) === "" ||
                                            priceForm.watch(
                                              `prices.${index}.durationUnit`
                                            ) === "other"
                                              ? ""
                                              : "w-full"
                                          }
                                        >
                                          <FormLabel>
                                            Duration
                                            <span className="text-red-500 ml-1">
                                              *
                                            </span>
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min="1"
                                              step="1"
                                              placeholder="Enter duration"
                                              value={
                                                field.value === 0
                                                  ? ""
                                                  : field.value
                                              }
                                              onChange={(e) => {
                                                const value = e.target.value;
                                                const numValue =
                                                  value === ""
                                                    ? 0
                                                    : Number(value);
                                                field.onChange(numValue);
                                              }}
                                              required
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                      rules={{
                                        validate: (value) => {
                                          if (!value || value === 0) {
                                            return "Duration cannot be 0";
                                          }
                                          return true;
                                        },
                                      }}
                                    />
                                  </div>
                                )}

                                <FormField
                                  control={priceForm.control}
                                  name={`prices.${index}.durationUnit`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Duration Unit
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="minutes">
                                              Time
                                            </SelectItem>
                                            {entityType === "coach" && (
                                              <>
                                                <SelectItem value="class">
                                                  Class
                                                </SelectItem>
                                              </>
                                            )}
                                            {entityType === "court" && (
                                              <>
                                                <SelectItem value="session">
                                                  Session
                                                </SelectItem>
                                              </>
                                            )}
                                            <SelectItem value="day">
                                              Day
                                            </SelectItem>
                                            <SelectItem value="month">
                                              Month
                                            </SelectItem>
                                            <SelectItem value="year">
                                              Year
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                  rules={{
                                    validate: (value) => {
                                      if (!value || value === "") {
                                        return "Duration unit is required";
                                      }
                                      return true;
                                    },
                                  }}
                                />
                              </div>

                              <Separator className="my-4 bg-transparent" />

                              <FormField
                                control={priceForm.control}
                                name={`prices.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Description (Optional)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        maxLength={100}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {field.value
                                        ? `${field.value.length}/100 characters`
                                        : "0/100 characters"}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}

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
