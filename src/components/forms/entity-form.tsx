import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
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
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { ScheduleCalendar } from "@/components/forms/schedule-calendar";
import GoogleAutoComplete from "@/components/shared/google-autocomplete";
import { useState } from "react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
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
    keyof EntityFormData | "website" | "schedules" | "experienceYears",
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
  const [priceRangeModes, setPriceRangeModes] = useState<
    Record<number, boolean>
  >({});

  const form = useForm<EntityFormData>({
    defaultValues: {
      name: "",
      location: "",
      longitude: "",
      latitude: "",
      description: "",
      phoneNumber: "",
      otherContacts: {},
      website: "",
      additionalDetails: "",
      schedules: [],
      prices:
        entityType === "stringer"
          ? [{ price: 0, stringName: "Service Fee" }]
          : [
              {
                minPrice: 0,
                maxPrice: 0,
                duration: 0,
                durationUnit: "minutes",
                description: "",
              },
            ],
      ...(entityType === "coach" && { experienceYears: 0 }),
      ...defaultValues,
    } as EntityFormData,
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
      appendPrice({
        minPrice: 0,
        maxPrice: 0,
        duration: 0,
        durationUnit: "minutes",
        description: "",
      });
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

    if (currentStep === 3 && entityType !== "stringer") {
      const prices = form.getValues("prices");
      for (let i = 0; i < prices.length; i++) {
        const price = prices[i];
        if ("durationUnit" in price && price.durationUnit !== "minutes") {
          if (!price.duration || price.duration === 0) {
            form.setError(`prices.${i}.duration`, {
              type: "required",
              message: "Duration cannot be 0",
            });
            return;
          }
        }
      }
    }

    if (currentStep === 3 && entityType !== "stringer") {
      const prices = form.getValues("prices");
      for (let i = 0; i < prices.length; i++) {
        const price = prices[i];
        if ("durationUnit" in price && price.durationUnit === "minutes") {
          if (!price.duration || price.duration === 0) {
            form.setError(`prices.${i}.duration`, {
              type: "required",
              message: "Duration cannot be 0",
            });
            return;
          }
        }
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
                  <p className="text-base font-medium text-gray-900 mt-1 break-words">
                    {formData.name}
                  </p>
                </div>
              )}
              {formData.location && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Location
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1 break-words">
                    {formData.location}
                  </p>
                </div>
              )}
              {formData.description && (
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Description
                  </span>
                  <div className="text-base font-medium text-gray-900 mt-1 prose prose-sm max-w-none">
                    <MarkdownRenderer>{formData.description}</MarkdownRenderer>
                  </div>
                </div>
              )}
              {formData.phoneNumber && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </span>
                  <p className="text-base font-medium text-gray-900 mt-1 break-words">
                    {formData.phoneNumber}
                  </p>
                </div>
              )}
              {formData.otherContacts &&
                Object.keys(formData.otherContacts).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Other Contacts
                    </span>
                    <div className="text-base font-medium text-gray-900 mt-1 break-words">
                      {Object.entries(formData.otherContacts).map(
                        ([type, contact]) => (
                          <div key={type} className="mb-1">
                            <span className="font-semibold capitalize">
                              {type}:
                            </span>{" "}
                            {contact}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              {entityType === "coach" &&
                "experienceYears" in formData &&
                formData.experienceYears !== 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Years of Experience
                    </span>
                    <p className="text-base font-medium text-gray-900 mt-1 break-words">
                      {formData.experienceYears}
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
                    <p className="text-base font-medium text-gray-900 mt-1 break-all hover:break-words">
                      {formData.website}
                    </p>
                  </div>
                )}
            </div>
          </div>

          <Separator className="my-8 bg-gray-400" />

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
                        <span className="font-semibold text-gray-900 break-words">
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
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full break-words">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {formData.prices &&
            formData.prices.length > 0 &&
            formData.prices.some((price) => {
              if (entityType === "stringer" && "price" in price) {
                return price.price > 0;
              } else if ("minPrice" in price) {
                return price.minPrice > 0;
              }
              return false;
            }) && (
              <div>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5 text-green-500" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  {formData.prices
                    .filter((price) => {
                      if (entityType === "stringer" && "price" in price) {
                        return price.price > 0;
                      } else if ("minPrice" in price) {
                        return price.minPrice > 0;
                      }
                      return false;
                    })
                    .map((price, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 break-words">
                              {entityType === "stringer" &&
                              "stringName" in price
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
                              "minPrice" in price &&
                              price.description && (
                                <p className="text-sm text-gray-600 mt-1 break-words">
                                  {price.description}
                                </p>
                              )}
                          </div>
                          {entityType === "stringer" &&
                            "stringName" in price && (
                              <span className="text-lg font-bold text-green-600 bg-white px-4 py-2 rounded-lg flex-shrink-0 ml-3">
                                ${price.price}
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {}

          {entityType === "stringer" &&
            "additionalDetails" in formData &&
            formData.additionalDetails &&
            formData.additionalDetails.trim() !== "" && (
              <>
                <Separator className="my-8 bg-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-700">
                    <Check className="h-5 w-5 text-green-500" />
                    Additional Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Additional Information
                    </span>
                    <div className="text-base font-medium text-gray-900 mt-1 prose prose-sm max-w-none">
                      <MarkdownRenderer>
                        {formData.additionalDetails}
                      </MarkdownRenderer>
                    </div>
                  </div>
                </div>
              </>
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
                      <MarkdownEditor
                        id="entity-description"
                        name="description"
                        autoComplete="off"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Describe your services, facilities, or any important information..."
                        maxLength={400}
                        showToolbar={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {entityType === "coach" && (
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="entity-experience-years">
                        Years of Experience
                        {requiredFields.experienceYears && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="entity-experience-years"
                          name="experienceYears"
                          type="number"
                          min="0"
                          autoComplete="off"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : Number(value));
                          }}
                          required={requiredFields.experienceYears}
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
                          value={field.value || ""}
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
                        value={field.value || ""}
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

              <FormField
                control={form.control}
                name="otherContacts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="entity-other-contacts">
                      Other Contacts
                      {(entityType === "coach" ||
                        entityType === "stringer") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {field.value && Object.keys(field.value).length > 0 && (
                          <div className="space-y-2">
                            {Object.entries(field.value).map(
                              ([type, contact]) => (
                                <div
                                  key={type}
                                  className="flex items-center gap-2"
                                >
                                  <Select
                                    value={type}
                                    onValueChange={(newType) => {
                                      if (newType && newType !== type) {
                                        const currentContacts = {
                                          ...field.value,
                                        };
                                        delete currentContacts[type];
                                        field.onChange({
                                          ...currentContacts,
                                          [newType]: contact,
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[
                                        {
                                          value: "wechat",
                                          label: "WeChat",
                                        },
                                        {
                                          value: "xiaohongshu",
                                          label: "Xiaohongshu",
                                        },
                                        {
                                          value: "instagram",
                                          label: "Instagram",
                                        },
                                        {
                                          value: "facebook",
                                          label: "Facebook",
                                        },
                                        {
                                          value: "whatsapp",
                                          label: "WhatsApp",
                                        },
                                        {
                                          value: "telegram",
                                          label: "Telegram",
                                        },
                                        { value: "line", label: "Line" },
                                        { value: "email", label: "Email" },
                                      ]
                                        .filter(
                                          (option) =>
                                            option.value === type ||
                                            !field.value ||
                                            !field.value[option.value]
                                        )
                                        .map((option) => (
                                          <SelectItem
                                            key={option.value}
                                            value={option.value}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={contact}
                                    onChange={(e) => {
                                      const currentContacts = field.value || {};
                                      const nextValue = e.target.value;
                                      field.onChange({
                                        ...currentContacts,
                                        [type]: nextValue,
                                      });
                                    }}
                                    onBlur={(e) => {
                                      if (
                                        type !== "xiaohongshu" &&
                                        type !== "instagram" &&
                                        type !== "facebook"
                                      )
                                        return;
                                      const currentContacts = field.value || {};
                                      const value = e.target.value?.trim();
                                      if (!value) return;

                                      const looksLikeUrl =
                                        /^(https?:\/\/|www\.)/i.test(value);
                                      if (!looksLikeUrl) return;

                                      let sanitized = value;
                                      try {
                                        const url = new URL(
                                          value.startsWith("http")
                                            ? value
                                            : `https://${value}`
                                        );
                                        sanitized = `${url.protocol}//${url.host}${url.pathname}`;
                                      } catch {
                                        const qIndex = value.indexOf("?");
                                        sanitized =
                                          qIndex !== -1
                                            ? value.substring(0, qIndex)
                                            : value;
                                      }

                                      if (sanitized !== value) {
                                        field.onChange({
                                          ...currentContacts,
                                          [type]: sanitized,
                                        });
                                      }
                                    }}
                                    className="flex-1"
                                    maxLength={150}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const currentContacts = {
                                        ...field.value,
                                      };
                                      delete currentContacts[type];
                                      field.onChange(currentContacts);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Select
                            value=""
                            onValueChange={(contactType) => {
                              if (contactType) {
                                const currentContacts = field.value || {};
                                if (!currentContacts[contactType]) {
                                  field.onChange({
                                    ...currentContacts,
                                    [contactType]: "",
                                  });
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Add contact" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                { value: "wechat", label: "WeChat" },
                                { value: "xiaohongshu", label: "Xiaohongshu" },
                                { value: "instagram", label: "Instagram" },
                                { value: "facebook", label: "Facebook" },
                                { value: "whatsapp", label: "WhatsApp" },
                                { value: "telegram", label: "Telegram" },
                                { value: "line", label: "Line" },
                                { value: "email", label: "Email" },
                              ]
                                .filter(
                                  (option) =>
                                    !field.value || !field.value[option.value]
                                )
                                .map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                rules={{
                  validate: (value) => {
                    if (
                      (!value || Object.keys(value).length === 0) &&
                      (entityType === "coach" || entityType === "stringer")
                    ) {
                      return "Other contacts are required";
                    }
                    if (value && Object.keys(value).length > 0) {
                      const hasEmptyValues = Object.values(value).some(
                        (contact) => !contact || contact.trim() === ""
                      );
                      if (hasEmptyValues) {
                        return "Contact values cannot be empty";
                      }
                    }
                    return true;
                  },
                }}
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
                    <div key={field.id}>
                      {index > 0 && <Separator className="my-6 bg-gray-400" />}
                      <div className="bg-transparent p-4 rounded-lg border border-gray-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700">
                            {index === 0
                              ? "Service Fee"
                              : `String Option ${index}`}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  <span className="text-red-500 ml-1">*</span>
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

                          {entityType !== "stringer" && (
                            <Separator className="my-4 bg-gray-400" />
                          )}

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
                      </div>
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
                    <div key={field.id} className="space-y-4">
                      {index > 0 && <Separator className="my-6" />}
                      <div className="bg-transparent p-4 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Pricing Option {index + 1}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`prices.${index}.minPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor={`min-price-${index}`}>
                                  {priceRangeModes[index]
                                    ? "Min Price ($)"
                                    : "Price ($)"}
                                  <span className="text-red-500 ml-1">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    id={`min-price-${index}`}
                                    name={`prices.${index}.minPrice`}
                                    type="number"
                                    min="1"
                                    step="1"
                                    autoComplete="off"
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const numValue =
                                        value === "" ? 0 : Number(value);
                                      field.onChange(numValue);
                                      const maxPriceField = form.getValues(
                                        `prices.${index}.maxPrice`
                                      );
                                      if (maxPriceField === field.value) {
                                        form.setValue(
                                          `prices.${index}.maxPrice`,
                                          numValue
                                        );
                                      }
                                    }}
                                    required={requiredFields.prices}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {priceRangeModes[index] && (
                            <FormField
                              control={form.control}
                              name={`prices.${index}.maxPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor={`max-price-${index}`}>
                                    Max Price ($)
                                    <span className="text-red-500 ml-1">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      id={`max-price-${index}`}
                                      name={`prices.${index}.maxPrice`}
                                      type="number"
                                      min="1"
                                      step="1"
                                      autoComplete="off"
                                      value={
                                        field.value === 0 ? "" : field.value
                                      }
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
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentMin = form.getValues(
                                `prices.${index}.minPrice`
                              );
                              const currentMax = form.getValues(
                                `prices.${index}.maxPrice`
                              );
                              const isRangeMode = priceRangeModes[index];

                              if (!isRangeMode) {
                                form.setValue(`prices.${index}.minPrice`, 0);
                                form.setValue(`prices.${index}.maxPrice`, 0);
                                setPriceRangeModes((prev) => ({
                                  ...prev,
                                  [index]: true,
                                }));
                              } else {
                                form.setValue(`prices.${index}.minPrice`, 0);
                                form.setValue(`prices.${index}.maxPrice`, 0);
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
                          {form.watch(`prices.${index}.durationUnit`) ===
                          "minutes" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
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
                                          const hours = Number(value) || 0;
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
                                                {i.toString().padStart(2, "0")}
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
                                control={form.control}
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
                                          const minutes = Number(value) || 0;
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
                                                {i.toString().padStart(2, "0")}
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
                            <div className="w-full">
                              <FormField
                                control={form.control}
                                name={`prices.${index}.duration`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel htmlFor={`duration-${index}`}>
                                      Duration
                                      <span className="text-red-500 ml-1">
                                        *
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        id={`duration-${index}`}
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="Enter duration"
                                        value={
                                          field.value === 0 ? "" : field.value
                                        }
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numValue =
                                            value === "" ? 0 : Number(value);
                                          field.onChange(numValue);
                                        }}
                                        required={requiredFields.prices}
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
                            control={form.control}
                            name={`prices.${index}.durationUnit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor={`duration-unit-${index}`}>
                                  Duration Unit
                                  <span className="text-red-500 ml-1">*</span>
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
                                      <SelectItem value="day">Day</SelectItem>
                                      <SelectItem value="month">
                                        Month
                                      </SelectItem>
                                      <SelectItem value="year">Year</SelectItem>
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
                          control={form.control}
                          name={`prices.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor={`description-${index}`}>
                                Description (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id={`description-${index}`}
                                  name={`prices.${index}.description`}
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
                          <MarkdownEditor
                            id="entity-additional-details"
                            name="additionalDetails"
                            autoComplete="off"
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Add any additional information about your stringing services, equipment, or special offers..."
                            maxLength={400}
                            showToolbar={true}
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
