import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Check, ArrowLeft, ArrowRight } from "lucide-react";
import {
  ScheduleCalendar,
  type ScheduleData,
} from "@/components/forms/schedule-calendar";
import GoogleAutoComplete from "@/components/shared/google-autocomplete";
import { useState } from "react";
import type { CourtFormData } from "@/services/courts";
import type { CoachFormData } from "@/services/coaches";
import type { StringerFormData } from "@/services/stringers";

type EntityType = "court" | "coach" | "stringer";
type EntityFormData = CourtFormData | CoachFormData | StringerFormData;

interface EntityFormProps {
  entityType: EntityType;
  onSubmit: (data: EntityFormData) => void;
  defaultValues?: Partial<EntityFormData>;
  isSubmitting?: boolean;
  requiredFields: Record<
    keyof EntityFormData | "website" | "schedules",
    boolean
  >;
}

export function EntityForm({
  entityType,
  onSubmit,
  defaultValues,
  isSubmitting,
  requiredFields,
}: EntityFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<EntityFormData | null>(null);

  const form = useForm<EntityFormData>({
    defaultValues: {
      name: "",
      location: "",
      longitude: "",
      latitude: "",
      description: "",
      phoneNumber: "",
      otherContacts: "",
      schedules: [],
      prices:
        entityType === "stringer"
          ? [{ price: 0, stringName: "Service Fee" }]
          : [{ price: 0, duration: 0 }],
      ...(entityType === "coach" && { experience_years: 0 }),
      ...defaultValues,
    },
  });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control: form.control,
    name: "prices",
  });

  const addPrice = () => {
    if (entityType === "stringer") {
      appendPrice({ price: 0, stringName: "" });
    } else {
      appendPrice({ price: 0, duration: 0 });
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

  const handleNext = async () => {
    const isValid = await form.trigger();

    if (currentStep === 2 && entityType === "court") {
      const schedules = form.getValues("schedules");
      if (requiredFields.schedules && (!schedules || schedules.length === 0)) {
        form.setError("schedules", {
          type: "required",
          message:
            "Operating hours are required. Please add at least one schedule.",
        });
        return;
      }
    }

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        const data = form.getValues();
        setFormData(data);
        setShowConfirmation(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    if (formData) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setFormData(null);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Basic Information";
      case 2:
        return entityType !== "stringer" ? "Schedule" : "Pricing";
      case 3:
        return entityType !== "stringer" ? "Pricing" : "Additional Details";
      default:
        return "";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return "Enter the basic details about this " + entityType;
      case 2:
        return entityType !== "stringer"
          ? "Set operating hours"
          : "Set pricing for services";
      case 3:
        return entityType !== "stringer"
          ? "Set pricing for services"
          : "Add any additional details";
      default:
        return "";
    }
  };

  if (showConfirmation && formData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Confirm {getEntityTitle()} Information
          </h2>
          <p className="text-muted-foreground">
            Please review all information before submitting
          </p>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5 text-green-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.name && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Name
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formData.name}
                  </p>
                </div>
              )}
              {formData.location && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Location
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formData.location}
                  </p>
                </div>
              )}
              {formData.description && (
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Description
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formData.description}
                  </p>
                </div>
              )}
              {formData.phoneNumber && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formData.phoneNumber}
                  </p>
                </div>
              )}
              {formData.otherContacts && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Other Contacts
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formData.otherContacts}
                  </p>
                </div>
              )}
              {entityType === "coach" &&
                "experience_years" in formData &&
                formData.experience_years && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Years of Experience
                    </span>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {formData.experience_years}
                    </p>
                  </div>
                )}
              {entityType === "court" &&
                "website" in formData &&
                formData.website && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Website
                    </span>
                    <p className="text-base font-medium text-gray-900 mt-1">
                      {formData.website}
                    </p>
                  </div>
                )}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Schedule */}
          {entityType !== "stringer" &&
            "schedules" in formData &&
            formData.schedules &&
            formData.schedules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5 text-green-500" />
                  Schedule
                </h3>
                <div className="space-y-3">
                  {formData.schedules.map((schedule, index) => (
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
                            ][
                              "dayOfWeek" in schedule
                                ? schedule.dayOfWeek - 1
                                : schedule.dayOfWeek - 1
                            ]
                          }
                        </span>
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full">
                          {"startTime" in schedule
                            ? `${schedule.startTime} - ${schedule.endTime}`
                            : `${schedule.openTime} - ${schedule.closeTime}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {formData.prices &&
            formData.prices.length > 0 &&
            formData.prices.some((price) => price.price > 0) && (
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5 text-green-500" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  {formData.prices
                    .filter((price) => price.price > 0)
                    .map((price, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {entityType === "stringer" &&
                              "stringName" in price
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
                          {entityType === "stringer" &&
                            "stringName" in price && (
                              <span className="text-lg font-bold text-green-600 bg-white px-4 py-2 rounded-lg">
                                ${price.price}
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Additional Details for Stringer */}
          {entityType === "stringer" &&
            "additionalDetails" in formData &&
            formData.additionalDetails &&
            formData.additionalDetails.trim() !== "" && (
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5 text-green-500" />
                  Additional Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Additional Information
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {formData.additionalDetails}
                  </p>
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="touch-manipulation relative z-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 touch-manipulation relative z-10"
          >
            {isSubmitting ? "Creating..." : `Create ${getEntityTitle()}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            {getStepTitle(currentStep)}
          </h2>
          <p className="text-muted-foreground">
            {getStepDescription(currentStep)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep
                  ? "bg-green-600 text-white"
                  : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step < currentStep ? <Check className="h-4 w-4" /> : step}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="entity-name">
                      Name
                      {requiredFields.name && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="entity-name"
                        name="name"
                        autoComplete="off"
                        {...field}
                        required={requiredFields.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="entity-location">
                      Location
                      {requiredFields.location && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <GoogleAutoComplete
                        value={field.value}
                        onSelect={(place) => {
                          form.setValue("location", place.name);
                          if (place.longitude && place.latitude) {
                            form.setValue(
                              "longitude",
                              place.longitude.toString()
                            );
                            form.setValue(
                              "latitude",
                              place.latitude.toString()
                            );
                          }
                        }}
                        onClear={() => {
                          form.setValue("location", "");
                          form.setValue("longitude", "");
                          form.setValue("latitude", "");
                        }}
                        inputProps={{
                          id: "entity-location",
                          name: "location",
                          autoComplete: "off",
                          required: requiredFields.location,
                          placeholder: "Search for a location...",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="entity-description">
                      Description
                      {requiredFields.description && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="entity-description"
                        name="description"
                        autoComplete="off"
                        {...field}
                        required={requiredFields.description}
                        maxLength={400}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {entityType === "coach" && (
                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="entity-experience-years">
                        Years of Experience
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="entity-experience-years"
                          name="experience_years"
                          type="number"
                          min="0"
                          autoComplete="off"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : Number(value));
                          }}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {entityType === "court" && (
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="entity-website">
                        Website
                        {requiredFields.website && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="entity-website"
                          name="website"
                          type="url"
                          autoComplete="off"
                          {...field}
                          required={requiredFields.website}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="entity-phone">
                      Phone Number
                      {requiredFields.phoneNumber && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="entity-phone"
                        name="phoneNumber"
                        type="tel"
                        autoComplete="off"
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          const digitsOnly = value.replace(/\D/g, "");

                          let formatted = "";
                          if (digitsOnly.length <= 3) {
                            formatted = digitsOnly;
                          } else if (digitsOnly.length <= 6) {
                            formatted = `(${digitsOnly.slice(
                              0,
                              3
                            )}) ${digitsOnly.slice(3)}`;
                          } else {
                            formatted = `(${digitsOnly.slice(
                              0,
                              3
                            )}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(
                              6,
                              10
                            )}`;
                          }

                          field.onChange(formatted);
                        }}
                        required={requiredFields.phoneNumber}
                        pattern="\(\d{3}\) \d{3}-\d{4}"
                        maxLength={14}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{
                  validate: (value) => {
                    if (!value && requiredFields.phoneNumber) {
                      return "Phone number is required";
                    }
                    if (value) {
                      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                      if (!phoneRegex.test(value)) {
                        return "Please enter a valid phone number in format (555) 123-4567";
                      }
                    }
                    return true;
                  },
                }}
              />

              {entityType === "stringer" && (
                <FormField
                  control={form.control}
                  name="additionalDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="entity-additional-details">
                        Additional Details
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="entity-additional-details"
                          name="additionalDetails"
                          autoComplete="off"
                          {...field}
                          maxLength={400}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="otherContacts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="entity-other-contacts">
                      Other Contacts
                      {requiredFields.otherContacts && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="entity-other-contacts"
                        name="otherContacts"
                        autoComplete="off"
                        {...field}
                        required={requiredFields.otherContacts}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              {entityType !== "stringer" ? (
                <FormField
                  control={form.control}
                  name="schedules"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>
                        Operating Hours
                        {"schedules" in requiredFields &&
                          requiredFields.schedules && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                      </FormLabel>
                      <ScheduleCalendar
                        schedules={value}
                        onChange={onChange}
                        entityType={entityType}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Pricing
                        {requiredFields.prices && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={addPrice}
                      variant="outline"
                      size="sm"
                      className="touch-manipulation relative z-10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Price
                    </Button>
                  </div>
                  {priceFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <FormField
                        control={form.control}
                        name={`prices.${index}.stringName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor={`string-name-${index}`}>
                              String
                            </FormLabel>
                            <FormControl>
                              <Input
                                id={`string-name-${index}`}
                                name={`prices.${index}.stringName`}
                                autoComplete="off"
                                placeholder={
                                  index === 0 ? "" : "e.g. Yonex BG65"
                                }
                                {...field}
                                value={
                                  index === 0 ? "Service Fee" : field.value
                                }
                                disabled={index === 0}
                                required={requiredFields.prices}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prices.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor={`price-${index}`}>
                              Price ($)
                            </FormLabel>
                            <FormControl>
                              <Input
                                id={`price-${index}`}
                                name={`prices.${index}.price`}
                                type="number"
                                min="1"
                                step="1"
                                autoComplete="off"
                                value={field.value === 0 ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? 0 : Number(value)
                                  );
                                }}
                                required={requiredFields.prices}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {priceFields.length > 1 && index !== 0 && (
                        <div className="flex justify-end md:col-span-2">
                          <Button
                            type="button"
                            onClick={() => removePrice(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 touch-manipulation relative z-10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Price
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              {entityType !== "stringer" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        Pricing
                        {requiredFields.prices && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={addPrice}
                      variant="outline"
                      size="sm"
                      className="touch-manipulation relative z-10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Price
                    </Button>
                  </div>
                  {priceFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <FormField
                        control={form.control}
                        name={`prices.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor={`duration-${index}`}>
                              Duration
                            </FormLabel>
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
                                    <SelectTrigger
                                      id={`duration-hours-${index}`}
                                      className="w-20"
                                    >
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
                                    <SelectTrigger
                                      id={`duration-minutes-${index}`}
                                      className="w-20"
                                    >
                                      <SelectValue placeholder="Minutes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 60 }, (_, i) => (
                                        <SelectItem
                                          key={i}
                                          value={i.toString()}
                                        >
                                          {i.toString().padStart(2, "0")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span className="text-sm text-muted-foreground">
                                    minutes
                                  </span>
                                </div>
                              </FormControl>
                            </div>
                            <FormDescription>
                              Maximum duration is 8 hours (480 minutes)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`prices.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor={`price-${index}`}>
                              Price ($)
                            </FormLabel>
                            <FormControl>
                              <Input
                                id={`price-${index}`}
                                name={`prices.${index}.price`}
                                type="number"
                                min="1"
                                step="1"
                                autoComplete="off"
                                value={field.value === 0 ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? 0 : Number(value)
                                  );
                                }}
                                required={requiredFields.prices}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {priceFields.length > 1 && (
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
                </div>
              ) : (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="additionalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="entity-additional-details">
                          Additional Details
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="entity-additional-details"
                            name="additionalDetails"
                            autoComplete="off"
                            {...field}
                            maxLength={400}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="touch-manipulation relative z-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 touch-manipulation relative z-10"
            >
              {currentStep === 3 ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Review & Submit
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
