import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import type { CourtScheduleData } from "@/services/courts";
import type { CoachScheduleData } from "@/services/coaches";
import type { EventInput, EventContentArg } from "@fullcalendar/core";

type ScheduleData = CourtScheduleData | CoachScheduleData;

interface ScheduleDisplayProps {
  schedules: ScheduleData[];
  onUpvote?: (scheduleId: string) => void;
}

export function ScheduleDisplay({ schedules, onUpvote }: ScheduleDisplayProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getTimeRange = (schedule: ScheduleData) => {
    if ("openTime" in schedule) {
      return `${schedule.openTime} - ${schedule.closeTime}`;
    }
    return `${schedule.startTime} - ${schedule.endTime}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayOfWeek === 7 ? 0 : dayOfWeek];
  };

  const events: EventInput[] = schedules.map((schedule) => ({
    id: schedule.id,
    title: getTimeRange(schedule),
    daysOfWeek: [schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek],
    startTime: "openTime" in schedule ? schedule.openTime : schedule.startTime,
    endTime: "openTime" in schedule ? schedule.closeTime : schedule.endTime,
    backgroundColor: "hsl(var(--primary))",
    borderColor: "hsl(var(--primary))",
    textColor: "hsl(var(--primary-foreground))",
    extendedProps: {
      upvotes: schedule.upvotes || 0,
    },
    classNames: [
      "cursor-pointer",
      "hover:opacity-90",
      "rounded-lg",
      "shadow-sm",
    ],
  }));

  if (isMobile) {
    return (
      <div className="space-y-3">
        {schedules.length === 0 && (
          <div className="text-muted-foreground text-center py-4">
            No schedules available
          </div>
        )}
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center justify-between bg-primary/10 rounded-lg p-3"
          >
            <div>
              <div className="font-semibold text-primary">
                {getDayName(schedule.dayOfWeek)}
              </div>
              <div className="text-sm text-muted-foreground">
                {getTimeRange(schedule)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {schedule.upvotes || 0}
              </span>
              {onUpvote && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="px-2 py-0.5 text-xs rounded-full bg-white/80 text-primary hover:bg-primary/10 border border-primary"
                  onClick={() => onUpvote(schedule.id)}
                >
                  Upvote
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        events={events}
        eventContent={renderEventContent}
        dayHeaderClassNames="bg-primary/10 text-primary font-semibold text-base border-b border-primary/10"
        slotLabelClassNames="text-muted-foreground font-medium"
        dayCellClassNames="bg-transparent border border-primary/10"
        eventClassNames="rounded-xl shadow-md border-2 border-primary bg-primary/90 text-white px-2 py-1 transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
        slotDuration="01:00:00"
        expandRows={true}
        aspectRatio={1.5}
        dayHeaderFormat={{ weekday: "short" }}
      />
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  const { timeText, event } = eventInfo;
  const upvotes = event.extendedProps.upvotes || 0;
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-1">
        <span className="font-bold text-sm">{timeText}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <ThumbsUp className="w-4 h-4 text-white/80" />
        <span className="text-xs font-semibold">{upvotes}</span>
        {event.extendedProps.onUpvote && (
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto px-2 py-0.5 text-xs rounded-full bg-white/80 text-primary hover:bg-primary/10 border border-primary"
            onClick={() => event.extendedProps.onUpvote(event.id)}
          >
            Upvote
          </Button>
        )}
      </div>
    </div>
  );
}
