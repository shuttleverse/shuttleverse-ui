import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  EventInput,
  DateSelectArg,
  EventClickArg,
} from "@fullcalendar/core";
import type { CoachFormScheduleData } from "@/services/coaches";
import type { CourtFormScheduleData } from "@/services/courts";
import { useIsMobile } from "@/hooks/use-mobile";

export type ScheduleData = CoachFormScheduleData | CourtFormScheduleData;

interface ScheduleCalendarProps {
  schedules: ScheduleData[];
  onChange: (schedules: ScheduleData[]) => void;
  entityType: "coach" | "court" | "stringer";
}

const DAYS_OF_WEEK = [
  { value: 7, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function ScheduleCalendar({
  schedules,
  onChange,
  entityType,
}: ScheduleCalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [mobileFormData, setMobileFormData] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    const calendarEvents = schedules.map((schedule, index) => ({
      id: index.toString(),
      title: "Operating Hours",
      daysOfWeek: [schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek],
      startTime:
        "startTime" in schedule ? schedule.startTime : schedule.openTime,
      endTime: "startTime" in schedule ? schedule.endTime : schedule.closeTime,
      backgroundColor: "hsl(var(--primary))",
      borderColor: "hsl(var(--primary))",
      textColor: "hsl(var(--primary-foreground))",
    }));
    setEvents(calendarEvents);
  }, [schedules]);

  const handleEventAdd = (info: DateSelectArg) => {
    const startDate = info.start;
    let endDate = info.end;

    if (
      endDate.getHours() === 0 &&
      endDate.getMinutes() === 0 &&
      Math.abs(startDate.getDay() - endDate.getDay()) === 1
    ) {
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 0, 0);
    }

    if (
      startDate.getDate() !== endDate.getDate() ||
      startDate.getMonth() !== endDate.getMonth() ||
      startDate.getFullYear() !== endDate.getFullYear()
    ) {
      info.view.calendar.unselect();
      return;
    }

    const jsDay = info.start.getDay();
    const apiDay = jsDay === 0 ? 7 : jsDay;

    const newSchedule =
      entityType === "coach"
        ? ({
            dayOfWeek: apiDay,
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
          } as CoachFormScheduleData)
        : ({
            dayOfWeek: apiDay,
            openTime: startDate.toTimeString().slice(0, 5),
            closeTime: endDate.toTimeString().slice(0, 5),
          } as CourtFormScheduleData);

    onChange([...schedules, newSchedule]);
  };

  const handleEventRemove = (info: EventClickArg) => {
    const index = parseInt(info.event.id);
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    onChange(updatedSchedules);
  };

  const handleDeleteSchedule = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    onChange(updatedSchedules);
  };

  const getTimeRange = (schedule: ScheduleData) => {
    if ("startTime" in schedule) {
      return `${schedule.startTime} - ${schedule.endTime}`;
    }
    return `${schedule.openTime} - ${schedule.closeTime}`;
  };

  const handleAddSchedule = () => {
    const newSchedule =
      entityType === "coach"
        ? ({
            dayOfWeek: mobileFormData.dayOfWeek,
            startTime: mobileFormData.startTime,
            endTime: mobileFormData.endTime,
          } as CoachFormScheduleData)
        : ({
            dayOfWeek: mobileFormData.dayOfWeek,
            openTime: mobileFormData.startTime,
            closeTime: mobileFormData.endTime,
          } as CourtFormScheduleData);

    onChange([...schedules, newSchedule]);
    setShowMobileForm(false);
    setMobileFormData({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(time);
      }
    }
    return times;
  };

  if (isMobile) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Operating Hours</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {schedules.map((schedule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-primary/10 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base">
                      {
                        DAYS_OF_WEEK[
                          schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek
                        ].label
                      }
                    </span>
                    <span className="text-sm text-gray-600">
                      {getTimeRange(schedule)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 ml-3"
                  onClick={(e) => handleDeleteSchedule(e, index)}
                >
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}

            {schedules.length === 0 && !showMobileForm && (
              <div className="text-center py-8 text-gray-500">
                <p>No operating hours set</p>
                <p className="text-sm">Tap the button below to add hours</p>
              </div>
            )}

            {!showMobileForm && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowMobileForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Operating Hours
              </Button>
            )}

            {showMobileForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Add Operating Hours</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Day of Week
                    </label>
                    <Select
                      value={mobileFormData.dayOfWeek.toString()}
                      onValueChange={(value) =>
                        setMobileFormData((prev) => ({
                          ...prev,
                          dayOfWeek: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Time
                      </label>
                      <Select
                        value={mobileFormData.startTime}
                        onValueChange={(value) =>
                          setMobileFormData((prev) => ({
                            ...prev,
                            startTime: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Time
                      </label>
                      <Select
                        value={mobileFormData.endTime}
                        onValueChange={(value) =>
                          setMobileFormData((prev) => ({
                            ...prev,
                            endTime: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowMobileForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={handleAddSchedule}
                    >
                      Add Hours
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl">Operating Hours</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="mb-4 relative">
          <div className="h-[500px] overflow-y-auto">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "",
                center: "",
                right: "",
              }}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleEventAdd}
              eventClick={handleEventRemove}
              selectOverlap={false}
              slotMinTime="06:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              height="100%"
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
              expandRows={true}
              stickyHeaderDates={true}
              nowIndicator={true}
              scrollTime="06:00:00"
              eventBackgroundColor="hsl(var(--primary))"
              eventBorderColor="hsl(var(--primary))"
              eventTextColor="hsl(var(--primary-foreground))"
              dayHeaderFormat={{ weekday: "short" }}
              slotLabelFormat={{
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }}
              navLinks={false}
              initialDate={new Date(2024, 0, 1)}
              titleFormat={{ weekday: "long" }}
              buttonText={{
                today: "",
              }}
            />
          </div>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {schedules.map((schedule, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-primary/10 rounded"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {
                      DAYS_OF_WEEK[
                        schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek
                      ].label
                    }
                  </span>
                  <span className="text-gray-600">
                    {getTimeRange(schedule)}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-shrink-0 ml-2"
                onClick={(e) => handleDeleteSchedule(e, index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
