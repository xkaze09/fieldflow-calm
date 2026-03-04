import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();
    const results: string[] = [];

    // 1. Find overdue tasks (due_date in the past, still pending)
    const { data: overdueTasks } = await supabase
      .from("tasks")
      .select("id, notes, due_date, related_lead_id, leads:related_lead_id(name, phone)")
      .eq("status", "pending")
      .lt("due_date", now)
      .limit(50);

    if (overdueTasks && overdueTasks.length > 0) {
      results.push(`Found ${overdueTasks.length} overdue task(s)`);

      const ownerPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
      if (ownerPhone) {
        const summaryLines = overdueTasks.map((t: any) => {
          const leadName = t.leads?.name || "Unknown";
          return `• ${leadName}: ${t.notes || "No notes"}`;
        });

        const smsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`;
        await fetch(smsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: ownerPhone,
            message: `⏰ ${overdueTasks.length} overdue task(s):\n${summaryLines.join("\n")}`,
          }),
        });
      }
    }

    // 2. Find jobs starting in the next hour
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { data: upcomingJobs } = await supabase
      .from("jobs")
      .select("id, scheduled_at, location, leads:lead_id(name, phone), technicians:technician_id(name, contact)")
      .eq("status", "scheduled")
      .gte("scheduled_at", now)
      .lte("scheduled_at", oneHourFromNow)
      .limit(50);

    if (upcomingJobs && upcomingJobs.length > 0) {
      results.push(`Found ${upcomingJobs.length} upcoming job(s) within 1 hour`);

      for (const job of upcomingJobs as any[]) {
        const techContact = job.technicians?.contact;
        if (techContact) {
          const smsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`;
          await fetch(smsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              to: techContact,
              message: `🔔 Reminder: Job for ${job.leads?.name || "customer"} at ${job.location || "TBD"} starts at ${new Date(job.scheduled_at).toLocaleTimeString()}.`,
            }),
          });
        }
      }
    }

    if (results.length === 0) {
      results.push("No overdue tasks or upcoming jobs found");
    }

    console.log("Reminder check:", results.join("; "));

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Reminder error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
