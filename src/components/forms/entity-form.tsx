import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleCalendar, type ScheduleData } from "./schedule-calendar";
import { type CoachFormData } from "@/services/coaches";
import { type StringerFormData } from "@/services/stringers";
import { type CourtFormData } from "@/services/courts";
import GoogleAutoComplete from "@/components/shared/google-autocomplete";

type EntityType = "court" | "coach" | "stringer";
type EntityFormData = CourtFormData | CoachFormData | StringerFormData;

interface EntityFormProps {
  entityType: EntityType;
  onSubmit: (data: EntityFormData) => void;
  defaultValues?: Partial<EntityFormData>;
  isSubmitting?: boolean;
  requiredFields: Record<keyof EntityFormData | "website", boolean>;
}

export function EntityForm({
  entityType,
  onSubmit,
  defaultValues,
  isSubmitting,
  requiredFields,
}: EntityFormProps) {
  const form = useForm<EntityFormData>({
    defaultValues: {
      name: "",
      location: "",
      longitude: "",
      latitude: "",
      description: "",
      ...(entityType === "court" ? { website: "" } : {}),
      phoneNumber: "",
      schedules: [],
      prices: [],
      ...(entityType === "stringer" ? { additionalDetails: "" } : {}),
      otherContacts: "",
      ...(entityType === "coach" ? { experience_years: 0 } : {}),
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
        throw new Error(`Invalid entity type: ${entityType}`);
    }
  };

  const getEntityNamePlaceholder = () => {
    switch (entityType) {
      case "court":
        return "e.g. Downtown Badminton Club";
      case "coach":
        return "e.g. John Smith";
      case "stringer":
        return "e.g. Stringer Name";
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {getEntityTitle()} Name
                    {requiredFields.name && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required={requiredFields.name} />
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
                  <FormLabel>
                    Location
                    {requiredFields.location && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <GoogleAutoComplete
                      value={field.value}
                      onSelect={(place) => {
                        if (place) {
                          form.setValue("location", place.name || "");
                          form.setValue(
                            "longitude",
                            place.longitude?.toString() || ""
                          );
                          form.setValue(
                            "latitude",
                            place.latitude?.toString() || ""
                          );
                        }
                      }}
                      onClear={() => {
                        form.setValue("location", "");
                        form.setValue("longitude", "");
                        form.setValue("latitude", "");
                      }}
                      inputProps={{
                        required: requiredFields.location,
                        style: {
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: "#ffffff",
                          transition: "all 0.2s ease-in-out",
                          outline: "none",
                        },
                        onFocus: (e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        },
                        onBlur: (e) => {
                          e.target.style.borderColor = "#e5e7eb";
                          e.target.style.boxShadow = "none";
                        },
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
                  <FormLabel>
                    Description
                    {requiredFields.description && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
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
                    <FormLabel>
                      Years of Experience
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel>
                      Website
                      {requiredFields.website && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        required={requiredFields.website}
                        type="url"
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
                  <FormLabel>
                    Phone Number
                    {requiredFields.phoneNumber && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      required={requiredFields.phoneNumber}
                      type="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {entityType === "stringer" && (
              <FormField
                control={form.control}
                name="additionalDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        maxLength={255}
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
                  <FormLabel>
                    Other Contacts
                    {requiredFields.otherContacts && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required={requiredFields.otherContacts}
                      maxLength={255}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {entityType !== "stringer" && (
          <FormField
            control={form.control}
            name="schedules"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <ScheduleCalendar
                  schedules={value as ScheduleData[]}
                  onChange={onChange}
                  entityType={entityType}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">
                {getEntityTitle()} Pricing
                {requiredFields.prices && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </CardTitle>
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
          <CardContent className="space-y-4">
            {priceFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name={`prices.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          required={requiredFields.prices}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {entityType === "stringer" ? (
                  <FormField
                    control={form.control}
                    name={`prices.${index}.stringName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>String</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Yonex BG65"
                            {...field}
                            required={requiredFields.prices}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name={`prices.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Select
                                value={Math.floor(field.value / 60).toString()}
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
                                    <SelectItem key={i} value={i.toString()}>
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
                                  const hours = Math.floor(field.value / 60);
                                  field.onChange(hours * 60 + minutes);
                                }}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue placeholder="Minutes" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 60 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
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
                )}

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
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : `Save ${getEntityTitle()}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
