import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type {
  EventInput,
  DateSelectArg,
  EventClickArg,
} from "@fullcalendar/core";

export type ScheduleData = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
};

interface ScheduleCalendarProps {
  schedules: ScheduleData[];
  onChange: (schedules: ScheduleData[]) => void;
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
}: ScheduleCalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    const calendarEvents = schedules.map((schedule, index) => ({
      id: index.toString(),
      title: "Operating Hours",
      daysOfWeek: [schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek],
      startTime: schedule.openTime,
      endTime: schedule.closeTime,
      backgroundColor: "hsl(var(--primary))",
      borderColor: "hsl(var(--primary))",
      textColor: "hsl(var(--primary-foreground))",
    }));
    setEvents(calendarEvents);
  }, [schedules]);

  const handleEventAdd = (info: DateSelectArg) => {
    const jsDay = info.start.getDay();
    const apiDay = jsDay === 0 ? 7 : jsDay;

    const newSchedule: ScheduleData = {
      dayOfWeek: apiDay,
      openTime: info.start.toTimeString().slice(0, 5),
      closeTime: info.end.toTimeString().slice(0, 5),
    };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operating Hours</CardTitle>
      </CardHeader>
      <CardContent>
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
              <div>
                <span className="font-medium">
                  {
                    DAYS_OF_WEEK[
                      schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek
                    ].label
                  }
                </span>
                <span className="ml-2">
                  {schedule.openTime} - {schedule.closeTime}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
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
