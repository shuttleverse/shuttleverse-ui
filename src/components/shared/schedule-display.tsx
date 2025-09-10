import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CourtScheduleData } from "@/services/courts";
import type { CoachScheduleData } from "@/services/coaches";
import type { EventInput, EventContentArg } from "@fullcalendar/core";
import React from "react";

type ScheduleData = CourtScheduleData | CoachScheduleData;

interface ScheduleDisplayProps {
  schedules: ScheduleData[];
  onUpvote?: (scheduleId: string) => void;
  hasUpvotedSchedule?: (scheduleId: string) => boolean;
  isUpvotesLoading?: boolean;
}

export function ScheduleDisplay({
  schedules,
  onUpvote,
  hasUpvotedSchedule,
  isUpvotesLoading = false,
}: ScheduleDisplayProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(
    null
  );
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getTimeRange = (schedule: ScheduleData) => {
    return `${schedule.startTime} - ${schedule.endTime}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayOfWeek === 7 ? 0 : dayOfWeek];
  };

  const handleScheduleClick = (schedule: ScheduleData) => {
    setSelectedSchedule(schedule);
    setIsInfoDialogOpen(true);
  };

  const handleUpvote = (scheduleId: string) => {
    if (onUpvote && !hasUpvotedSchedule?.(scheduleId) && !isUpvotesLoading) {
      setIsInfoDialogOpen(false);

      onUpvote(scheduleId);

      if (selectedSchedule && selectedSchedule.id === scheduleId) {
        setSelectedSchedule({
          ...selectedSchedule,
          upvotes: (selectedSchedule.upvotes || 0) + 1,
        });
      }
    }
  };

  const events: EventInput[] = schedules.map((schedule) => ({
    id: schedule.id,
    title: getTimeRange(schedule),
    daysOfWeek: [schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek],
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    backgroundColor: "hsl(var(--primary))",
    borderColor: "hsl(var(--primary))",
    textColor: "hsl(var(--primary-foreground))",
    extendedProps: {
      schedule,
      upvotes: schedule.upvotes || 0,
      hasUpvoted: hasUpvotedSchedule?.(schedule.id) || false,
      isUpvotesLoading,
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
      <>
        <div className="space-y-3">
          {schedules.length === 0 && (
            <div className="text-muted-foreground text-center py-4">
              No schedules available
            </div>
          )}
          {schedules.map((schedule) => {
            const hasUpvoted = hasUpvotedSchedule?.(schedule.id) || false;

            return (
              <div
                key={schedule.id}
                className="flex items-center justify-between bg-primary/10 rounded-lg p-3 gap-3 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleScheduleClick(schedule)}
              >
                <div className="flex-shrink min-w-0 flex-1">
                  <div className="font-semibold text-primary text-sm">
                    {getDayName(schedule.dayOfWeek)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {getTimeRange(schedule)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">
                    {schedule.upvotes || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Details</DialogTitle>
            </DialogHeader>
            {selectedSchedule && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Day:</span>
                    <span>{getDayName(selectedSchedule.dayOfWeek)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time:</span>
                    <span>{getTimeRange(selectedSchedule)}</span>
                  </div>
                  {selectedSchedule.submittedBy && (
                    <div className="flex justify-between">
                      <span className="font-medium">Submitted by:</span>
                      <span>{selectedSchedule.submittedBy.username}</span>
                    </div>
                  )}
                  {selectedSchedule.updatedAt && (
                    <div className="flex justify-between">
                      <span className="font-medium">Last updated:</span>
                      <span>
                        {new Date(
                          selectedSchedule.updatedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">
                      {selectedSchedule.upvotes || 0} upvotes
                    </span>
                  </div>
                  {onUpvote && (
                    <Button
                      onClick={() => handleUpvote(selectedSchedule.id)}
                      disabled={
                        hasUpvotedSchedule?.(selectedSchedule.id) ||
                        isUpvotesLoading
                      }
                      className={`${
                        hasUpvotedSchedule?.(selectedSchedule.id)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      {hasUpvotedSchedule?.(selectedSchedule.id)
                        ? "Upvoted"
                        : "Upvote"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto h-full">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          height="90%"
          slotMinTime="5:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          events={events}
          eventContent={renderEventContent}
          eventClick={(info) => {
            const schedule = info.event.extendedProps.schedule;
            if (schedule) {
              handleScheduleClick(schedule);
            }
          }}
          dayHeaderClassNames="bg-primary/10 text-primary font-semibold text-base border-b border-primary/10"
          slotLabelClassNames="text-muted-foreground font-medium"
          dayCellClassNames="bg-transparent border border-primary/10"
          eventClassNames="rounded-xl shadow-md border-2 border-primary bg-primary/90 text-white px-2 py-1 transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
          slotDuration="01:00:00"
          expandRows={true}
          aspectRatio={1.5}
          dayHeaderFormat={{ weekday: "short" }}
          eventDisplay="block"
          eventMinHeight={25}
          eventMinWidth={40}
          eventOverlap={true}
          slotEventOverlap={true}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: false,
          }}
        />
      </div>

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Details</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Day:</span>
                  <span>{getDayName(selectedSchedule.dayOfWeek)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>{getTimeRange(selectedSchedule)}</span>
                </div>
                {selectedSchedule.submittedBy && (
                  <div className="flex justify-between">
                    <span className="font-medium">Submitted by:</span>
                    <span>{selectedSchedule.submittedBy.username}</span>
                  </div>
                )}
                {selectedSchedule.updatedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Last updated:</span>
                    <span>
                      {new Date(
                        selectedSchedule.updatedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">
                    {selectedSchedule.upvotes || 0} upvotes
                  </span>
                </div>
                {onUpvote && (
                  <Button
                    onClick={() => handleUpvote(selectedSchedule.id)}
                    disabled={
                      hasUpvotedSchedule?.(selectedSchedule.id) ||
                      isUpvotesLoading
                    }
                    className={`${
                      hasUpvotedSchedule?.(selectedSchedule.id)
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {hasUpvotedSchedule?.(selectedSchedule.id)
                      ? "Upvoted"
                      : "Upvote"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  const { timeText, event } = eventInfo;
  const schedule = event.extendedProps.schedule;
  const upvotes = event.extendedProps.upvotes || 0;

  const startTime = new Date(event.start!);
  const endTime = new Date(event.end!);
  const durationInMinutes =
    (endTime.getTime() - startTime.getTime()) / (1000 * 60);

  const overlappingEvents = eventInfo.view.calendar
    .getEvents()
    .filter(
      (e) =>
        e.id !== event.id &&
        e.start &&
        e.end &&
        event.start &&
        event.end &&
        e.start.getTime() < event.end.getTime() &&
        e.end.getTime() > event.start.getTime() &&
        e.start.getDate() === event.start.getDate()
    );
  const hasOverlap = overlappingEvents.length > 0;

  return (
    <div className="flex flex-col h-full justify-between p-1 cursor-pointer transition-all relative">
      {hasOverlap ? (
        <div className="absolute inset-0 flex items-center justify-center"></div>
      ) : durationInMinutes < 120 ? (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          <Info className="w-4 h-4 text-white/90 flex-shrink-0" />
          <span className="text-xs font-semibold text-white/90">{upvotes}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-bold text-xs leading-tight">{timeText}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 min-w-0">
            <Info className="w-4 h-4 text-white/90 flex-shrink-0" />
            <span className="text-xs font-semibold text-white/90">
              {upvotes}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
