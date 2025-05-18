import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
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

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

const COMMON_DURATIONS = [
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
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
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Add a New Court
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                Basic Information
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Court Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="e.g. Downtown Badminton Club"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="mb-4 relative">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={locationInputRef}
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="123 Main St, Anytown, USA"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe the court facilities, hours, etc."
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.website ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="e.g. https://example.com"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-500">{errors.website}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="e.g. (123) 456-7890"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-lg font-semibold text-gray-700">
                  Operating Hours
                </h2>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md hover:bg-emerald-100 md:hidden"
                >
                  + Add Schedule
                </button>
              </div>

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
                        selectInfo.start.getDay() === selectInfo.end.getDay()
                      );
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click and drag on the calendar to add operating hours. Click
                  an existing block to remove it.
                </p>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Current Schedule:
                  </h3>
                  <div className="space-y-2">
                    {formData.schedules.length > 0 ? (
                      formData.schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center text-sm">
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
                          <button
                            type="button"
                            onClick={() => removeSchedule(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No schedules added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:hidden">
                {formData.schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Schedule #{index + 1}</h3>
                      {formData.schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSchedule(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day
                        </label>
                        <select
                          value={schedule.dayOfWeek}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "dayOfWeek",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                        {errors[`schedules[${index}].dayOfWeek`] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors[`schedules[${index}].dayOfWeek`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Open Time
                        </label>
                        <input
                          type="time"
                          value={schedule.openTime}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "openTime",
                              e.target.value
                            )
                          }
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors[`schedules[${index}].openTime`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        />
                        {errors[`schedules[${index}].openTime`] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors[`schedules[${index}].openTime`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Close Time
                        </label>
                        <input
                          type="time"
                          value={schedule.closeTime}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "closeTime",
                              e.target.value
                            )
                          }
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors[`schedules[${index}].closeTime`]
                              ? "border-red-500"
                              : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        />
                        {errors[`schedules[${index}].closeTime`] && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors[`schedules[${index}].closeTime`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-lg font-semibold text-gray-700">
                  Court Pricing
                </h2>
                <button
                  type="button"
                  onClick={addPrice}
                  className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md hover:bg-emerald-100"
                >
                  + Add Price
                </button>
              </div>

              {formData.prices.map((price, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50"
                >
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Price Option #{index + 1}</h3>
                    {formData.prices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrice(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={price.price}
                        onChange={(e) =>
                          handlePriceChange(index, "price", e.target.value)
                        }
                        min="0"
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`prices[${index}].price`]
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                      {errors[`prices[${index}].price`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`prices[${index}].price`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={price.duration}
                        onChange={(e) =>
                          handlePriceChange(index, "duration", e.target.value)
                        }
                        min="1"
                        max="480"
                        step="1"
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors[`prices[${index}].duration`]
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                      {errors[`prices[${index}].duration`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`prices[${index}].duration`]}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Enter any value from 1 to 480 minutes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {submissionStatus.error && (
              <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md text-red-700">
                {submissionStatus.error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/courts")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`px-4 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700 ${
                  isPending ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {getSubmitButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddCourt;
