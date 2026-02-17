import { Layout } from "@/components/Layout";
import { useJobs } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useUpdateJob } from "@/hooks/useUpdateJob";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import resourceDayGridPlugin from "@fullcalendar/resource-daygrid";
import type { EventDropArg, EventClickArg } from "@fullcalendar/core";
import { CalendarDays, RefreshCw, Link2, Unlink } from "lucide-react";

const TECH_COLORS = [
  "hsl(186, 100%, 35%)",
  "hsl(28, 90%, 55%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 80%, 55%)",
  "hsl(340, 75%, 55%)",
  "hsl(200, 80%, 50%)",
  "hsl(160, 60%, 45%)",
];

export default function Schedule() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: technicians, isLoading: techsLoading } = useTechnicians();
  const updateJob = useUpdateJob();
  const calendarRef = useRef<FullCalendar>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const gcal = useGoogleCalendar();

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      gcal.exchangeCode(code);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, gcal.exchangeCode, setSearchParams]);

  const resources = useMemo(() => {
    if (!technicians) return [];
    return [
      { id: "unassigned", title: "Unassigned", color: "hsl(215, 15%, 45%)" },
      ...technicians.map((t, i) => ({
        id: t.id,
        title: t.name,
        color: TECH_COLORS[i % TECH_COLORS.length],
      })),
    ];
  }, [technicians]);

  const events = useMemo(() => {
    if (!jobs) return [];
    return jobs.map((job) => {
      const techId = job.technician_id || "unassigned";
      const resource = resources.find((r) => r.id === techId);
      const customerName = (job as any).leads?.name || "No Customer";
      return {
        id: job.id,
        title: `${customerName}${job.location ? ` • ${job.location}` : ""}`,
        start: job.scheduled_at || job.created_at,
        end: job.scheduled_at
          ? new Date(new Date(job.scheduled_at).getTime() + (Number(job.labor_hours) || 1) * 3600000).toISOString()
          : undefined,
        resourceId: techId,
        backgroundColor: resource?.color || "hsl(215, 15%, 45%)",
        borderColor: resource?.color || "hsl(215, 15%, 45%)",
        extendedProps: {
          status: job.status,
          totalPrice: job.total_price,
          techName: (job as any).technicians?.name || "Unassigned",
        },
      };
    });
  }, [jobs, resources]);

  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      const { event } = info;
      const newStart = event.start;
      const newResourceId = event.getResources()[0]?.id;

      if (!newStart) {
        info.revert();
        return;
      }

      try {
        const updates: { id: string; scheduled_at: string; technician_id?: string | null } = {
          id: event.id,
          scheduled_at: newStart.toISOString(),
        };

        if (newResourceId) {
          updates.technician_id = newResourceId === "unassigned" ? null : newResourceId;
        }

        await updateJob.mutateAsync(updates);
        toast.success("Job rescheduled");
      } catch (e: any) {
        info.revert();
        toast.error(e.message);
      }
    },
    [updateJob]
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    toast.info(`Job: ${info.event.title}`);
  }, []);

  const handleConnectGoogle = useCallback(async () => {
    try {
      const url = await gcal.getAuthUrl();
      window.location.href = url;
    } catch {
      toast.error("Failed to get Google auth URL. Check that credentials are configured.");
    }
  }, [gcal]);

  const isLoading = jobsLoading || techsLoading;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarDays className="h-8 w-8 text-primary" />
              Schedule
            </h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop jobs to reschedule across technicians.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {gcal.loading ? (
              <Skeleton className="h-9 w-40" />
            ) : gcal.connected ? (
              <>
                <Button variant="outline" size="sm" onClick={gcal.syncJobs} disabled={gcal.syncing}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${gcal.syncing ? "animate-spin" : ""}`} />
                  {gcal.syncing ? "Syncing..." : "Sync to Google"}
                </Button>
                <Button variant="ghost" size="sm" onClick={gcal.disconnect}>
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnectGoogle}>
                <Link2 className="h-4 w-4 mr-1" />
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Job Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[500px] w-full" />
              </div>
            ) : (
              <div className="fc-wrapper">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    resourceTimeGridPlugin,
                    resourceDayGridPlugin,
                  ]}
                  initialView="resourceTimeGridDay"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "resourceTimeGridDay,resourceTimeGridWeek,dayGridMonth",
                  }}
                  views={{
                    resourceTimeGridDay: { buttonText: "Day" },
                    resourceTimeGridWeek: {
                      type: "resourceTimeGrid",
                      duration: { weeks: 1 },
                      buttonText: "Week",
                    },
                    dayGridMonth: { buttonText: "Month" },
                  }}
                  resources={resources}
                  events={events}
                  editable={true}
                  droppable={true}
                  eventDrop={handleEventDrop}
                  eventClick={handleEventClick}
                  slotMinTime="06:00:00"
                  slotMaxTime="21:00:00"
                  allDaySlot={false}
                  height="auto"
                  contentHeight={600}
                  nowIndicator={true}
                  eventDisplay="block"
                  resourceAreaHeaderContent="Technician"
                  resourceAreaWidth="140px"
                  schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
