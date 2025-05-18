import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/layout";
import {
  useCreateCourt,
  useAddCourtSchedule,
  useAddCourtPrice,
  type CourtFormData,
  type CourtSchedule,
  type CourtPrice,
} from "@/services/courts";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const DAY_NUMBER_MAP = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
};

const AddCourt = () => {
  const navigate = useNavigate();
  const { mutate: createCourt, isPending: isCreatingCourt } = useCreateCourt();
  const { mutate: addSchedules, isPending: isAddingSchedules } =
    useAddCourtSchedule();
  const { mutate: addPrices, isPending: isAddingPrices } = useAddCourtPrice();

  const locationInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CourtFormData>({
    name: "",
    location: "",
    description: "",
    website: "",
    phoneNumber: "",
    schedules: [{ dayOfWeek: 1, openTime: "09:00", closeTime: "21:00" }],
    prices: [{ price: 0, duration: 60 }],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CourtFormData | string, string>>
  >({});

  const [submissionStatus, setSubmissionStatus] = useState({
    step: 0,
    error: null as string | null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleScheduleChange = (
    index: number,
    field: keyof CourtSchedule,
    value: string | number
  ) => {
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: field === "dayOfWeek" ? Number(value) : value,
    };

    setFormData((prev) => ({
      ...prev,
      schedules: updatedSchedules,
    }));

    const errorKey = `schedules[${index}].${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handlePriceChange = (
    index: number,
    field: keyof CourtPrice,
    value: string
  ) => {
    const updatedPrices = [...formData.prices];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: field === "duration" ? Number(value) : Number(value),
    };

    setFormData((prev) => ({
      ...prev,
      prices: updatedPrices,
    }));

    const errorKey = `prices[${index}].${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { dayOfWeek: 1, openTime: "09:00", closeTime: "21:00" },
      ],
    }));
  };

  const removeSchedule = (index: number) => {
    if (formData.schedules.length <= 1) return;

    const updatedSchedules = [...formData.schedules];
    updatedSchedules.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      schedules: updatedSchedules,
    }));
  };

  const addPrice = () => {
    setFormData((prev) => ({
      ...prev,
      prices: [...prev.prices, { price: 0, duration: 60 }],
    }));
  };

  const removePrice = (index: number) => {
    if (formData.prices.length <= 1) return;

    const updatedPrices = [...formData.prices];
    updatedPrices.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      prices: updatedPrices,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Court name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      formData.website &&
      !formData.website
        .trim()
        .match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/)
    ) {
      newErrors.website = "Please enter a valid website URL";
    }

    if (
      formData.phoneNumber &&
      !formData.phoneNumber
        .trim()
        .match(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    formData.schedules.forEach((schedule, index) => {
      if (!schedule.openTime) {
        newErrors[`schedules[${index}].openTime`] = "Opening time is required";
      }

      if (!schedule.closeTime) {
        newErrors[`schedules[${index}].closeTime`] = "Closing time is required";
      }

      if (
        schedule.openTime &&
        schedule.closeTime &&
        schedule.openTime >= schedule.closeTime
      ) {
        newErrors[`schedules[${index}].closeTime`] =
          "Closing time must be after opening time";
      }
    });

    formData.prices.forEach((price, index) => {
      if (price.price < 0) {
        newErrors[`prices[${index}].price`] = "Price cannot be negative";
      }

      if (price.duration <= 0) {
        newErrors[`prices[${index}].duration`] =
          "Duration must be greater than 0";
      }

      if (price.duration > 480) {
        newErrors[`prices[${index}].duration`] =
          "Duration cannot exceed 8 hours (480 minutes)";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmissionStatus({ step: 1, error: null });

      createCourt(formData, {
        onSuccess: (courtData) => {
          const data = courtData.data;
          const courtId = data.id;

          const schedulePromise =
            formData.schedules.length > 0
              ? new Promise((resolve, reject) => {
                  addSchedules(
                    { courtId, scheduleData: formData.schedules },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    }
                  );
                })
              : Promise.resolve();

          const pricePromise =
            formData.prices.length > 0
              ? new Promise((resolve, reject) => {
                  addPrices(
                    { courtId, priceData: formData.prices },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    }
                  );
                })
              : Promise.resolve();

          Promise.all([schedulePromise, pricePromise])
            .then(() => {
              setSubmissionStatus({ step: 4, error: null });
              navigate("/courts");
            })
            .catch((error) => {
              console.error("Failed to complete court setup:", error);
              setSubmissionStatus({
                step: 2,
                error:
                  "Failed to complete the court setup. The court was created but additional details could not be saved. Please try editing the court later.",
              });
            });
        },
        onError: (error) => {
          console.error("Failed to create court:", error);
          setSubmissionStatus({
            step: 0,
            error: "Failed to create the court.",
          });
        },
      });
    }
  };

  const getCalendarEvents = () => {
    return formData.schedules.map((schedule, index) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const eventDate = new Date(startOfWeek);
      eventDate.setDate(
        startOfWeek.getDate() +
          DAY_NUMBER_MAP[schedule.dayOfWeek as keyof typeof DAY_NUMBER_MAP]
      );

      const startDateTime = new Date(eventDate);
      const [startHours, startMinutes] = schedule.openTime
        .split(":")
        .map(Number);
      startDateTime.setHours(startHours, startMinutes, 0);

      const endDateTime = new Date(eventDate);
      const [endHours, endMinutes] = schedule.closeTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes, 0);

      return {
        id: String(index),
        title: "Open Hours",
        start: startDateTime,
        end: endDateTime,
        backgroundColor: "#10b981",
        borderColor: "#059669",
        extendedProps: {
          scheduleIndex: index,
        },
      };
    });
  };

  const handleCalendarSelect = (selectInfo: DateSelectArg) => {
    const { start, end } = selectInfo;

    const dayOfWeek = start.getDay();
    const openTime = `${String(start.getHours()).padStart(2, "0")}:${String(
      start.getMinutes()
    ).padStart(2, "0")}`;
    const closeTime = `${String(end.getHours()).padStart(2, "0")}:${String(
      end.getMinutes()
    ).padStart(2, "0")}`;

    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { dayOfWeek, openTime, closeTime }],
    }));

    if (selectInfo.view.calendar) {
      selectInfo.view.calendar.unselect();
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const scheduleIndex = clickInfo.event.extendedProps.scheduleIndex;
    removeSchedule(scheduleIndex);
  };

  const isPending = isCreatingCourt || isAddingSchedules || isAddingPrices;

  const getSubmitButtonText = () => {
    if (submissionStatus.step === 1) return "Creating Court...";
    if (submissionStatus.step === 2) return "Adding Schedules...";
    if (submissionStatus.step === 3) return "Adding Prices...";
    return isPending ? "Saving..." : "Add Court";
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Add a New Court
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Court Details</CardTitle>
              <CardDescription>
                Enter the details of the badminton court you want to add.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Basic Information
                  </h2>
                  <Separator />

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">
                        Court Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Downtown Badminton Club"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        ref={locationInputRef}
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="123 Main St, Anytown, USA"
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the court facilities, hours, etc."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="e.g. https://example.com"
                        className={errors.website ? "border-red-500" : ""}
                      />
                      {errors.website && (
                        <p className="text-sm text-red-500">{errors.website}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="e.g. (123) 456-7890"
                        className={errors.phoneNumber ? "border-red-500" : ""}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">
                      Operating Hours
                    </h2>
                    <Button
                      type="button"
                      onClick={addSchedule}
                      variant="outline"
                      size="sm"
                      className="md:flex hidden"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Schedule
                    </Button>
                  </div>
                  <Separator />

                  <div className="hidden md:block mb-6">
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={false}
                        dayHeaderFormat={{ weekday: "long" }}
                        allDaySlot={false}
                        slotMinTime="06:00:00"
                        slotMaxTime="23:00:00"
                        height="auto"
                        events={getCalendarEvents()}
                        selectable={true}
                        selectMirror={true}
                        select={handleCalendarSelect}
                        eventClick={handleEventClick}
                        eventTimeFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }}
                        selectAllow={(selectInfo) => {
                          return (
                            selectInfo.start.getDay() ===
                            selectInfo.end.getDay()
                          );
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Click and drag on the calendar to add operating hours.
                      Click an existing block to remove it.
                    </p>
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-700 mb-2">
                        Current Schedule:
                      </h3>
                      <div className="space-y-2">
                        {formData.schedules.length > 0 ? (
                          formData.schedules.map((schedule, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm"
                            >
                              <span className="w-32 font-medium">
                                {
                                  DAYS_OF_WEEK.find(
                                    (d) => d.value === schedule.dayOfWeek
                                  )?.label
                                }
                                :
                              </span>
                              <span>
                                {schedule.openTime} - {schedule.closeTime}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeSchedule(index)}
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-red-500 hover:text-red-700 p-0 h-auto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            No schedules added yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden space-y-4">
                    <Button
                      type="button"
                      onClick={addSchedule}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Schedule
                    </Button>

                    {formData.schedules.map((schedule, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-md">
                              Schedule #{index + 1}
                            </CardTitle>
                            {formData.schedules.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeSchedule(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 p-0 h-auto hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label className="text-sm">Day</Label>
                              <Select
                                value={schedule.dayOfWeek.toString()}
                                onValueChange={(value) =>
                                  handleScheduleChange(
                                    index,
                                    "dayOfWeek",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DAYS_OF_WEEK.map((day) => (
                                    <SelectItem
                                      key={day.value}
                                      value={day.value.toString()}
                                    >
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors[`schedules[${index}].dayOfWeek`] && (
                                <p className="text-sm text-red-500">
                                  {errors[`schedules[${index}].dayOfWeek`]}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-sm">Open Time</Label>
                              <Input
                                type="time"
                                value={schedule.openTime}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    index,
                                    "openTime",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors[`schedules[${index}].openTime`]
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {errors[`schedules[${index}].openTime`] && (
                                <p className="text-sm text-red-500">
                                  {errors[`schedules[${index}].openTime`]}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-sm">Close Time</Label>
                              <Input
                                type="time"
                                value={schedule.closeTime}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    index,
                                    "closeTime",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors[`schedules[${index}].closeTime`]
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {errors[`schedules[${index}].closeTime`] && (
                                <p className="text-sm text-red-500">
                                  {errors[`schedules[${index}].closeTime`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Court Pricing */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">
                      Court Pricing
                    </h2>
                    <Button
                      type="button"
                      onClick={addPrice}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Price
                    </Button>
                  </div>
                  <Separator />

                  <div className="grid gap-4">
                    {formData.prices.map((price, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-md">
                              Price Option #{index + 1}
                            </CardTitle>
                            {formData.prices.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removePrice(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 p-0 h-auto hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-sm">Price ($)</Label>
                              <Input
                                type="number"
                                value={price.price}
                                onChange={(e) =>
                                  handlePriceChange(
                                    index,
                                    "price",
                                    e.target.value
                                  )
                                }
                                min="0"
                                step="0.01"
                                className={
                                  errors[`prices[${index}].price`]
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {errors[`prices[${index}].price`] && (
                                <p className="text-sm text-red-500">
                                  {errors[`prices[${index}].price`]}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-sm">
                                Duration (minutes)
                              </Label>
                              <Input
                                type="number"
                                value={price.duration}
                                onChange={(e) =>
                                  handlePriceChange(
                                    index,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                min="1"
                                max="480"
                                step="1"
                                className={
                                  errors[`prices[${index}].duration`]
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {errors[`prices[${index}].duration`] && (
                                <p className="text-sm text-red-500">
                                  {errors[`prices[${index}].duration`]}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Enter any value from 1 to 480 minutes
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {submissionStatus.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {submissionStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => navigate("/courts")}
                    variant="outline"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={isPending ? "opacity-70" : ""}
                  >
                    {getSubmitButtonText()}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddCourt;
