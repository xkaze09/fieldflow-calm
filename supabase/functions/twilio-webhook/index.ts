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

    // Twilio sends form-urlencoded data
    const formData = await req.formData();
    const callSid = formData.get("CallSid") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;
    const callStatus = formData.get("CallStatus") as string;
    const direction = formData.get("Direction") as string;
    const duration = formData.get("CallDuration") as string;

    console.log(`Twilio webhook: ${callStatus} from ${from} to ${to}`);

    // Map Twilio status to our status
    const statusMap: Record<string, string> = {
      ringing: "ringing",
      "in-progress": "answered",
      completed: "answered",
      busy: "missed",
      "no-answer": "missed",
      failed: "missed",
      canceled: "missed",
    };
    const status = statusMap[callStatus] || "answered";

    // Check for existing call by twilio_sid
    const { data: existingCall } = await supabase
      .from("calls")
      .select("id")
      .eq("twilio_sid", callSid)
      .maybeSingle();

    if (existingCall) {
      // Update existing call
      const updateData: Record<string, unknown> = { status };
      if (duration) {
        updateData.duration_seconds = parseInt(duration, 10);
        updateData.ended_at = new Date().toISOString();
      }
      await supabase.from("calls").update(updateData).eq("id", existingCall.id);
    } else {
      // Find or create lead
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", from)
        .maybeSingle();

      let leadId = existingLead?.id;

      if (!leadId) {
        const { data: newLead } = await supabase
          .from("leads")
          .insert({ name: from, phone: from, status: "new" })
          .select("id")
          .single();
        leadId = newLead?.id;
      }

      // Insert call
      await supabase.from("calls").insert({
        twilio_sid: callSid,
        from_number: from,
        to_number: to,
        status,
        lead_id: leadId,
        duration_seconds: duration ? parseInt(duration, 10) : 0,
      });

      // If missed, create follow-up task and send SMS alert
      if (status === "missed" && leadId) {
        await supabase.from("tasks").insert({
          type: "follow-up",
          priority: "high",
          status: "pending",
          notes: `Missed call from ${from}`,
          related_lead_id: leadId,
          due_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });

        // Trigger SMS alert
        try {
          const smsUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`;
          await fetch(smsUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              to: Deno.env.get("TWILIO_PHONE_NUMBER"),
              message: `⚠️ Missed call from ${from} on line ${to}. Follow-up task created.`,
            }),
          });
        } catch (smsError) {
          console.error("SMS alert failed:", smsError);
        }
      }
    }

    // Return TwiML for initial webhook (ringing state)
    if (callStatus === "ringing" || !callStatus) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. Please hold while we connect you.</Say>
</Response>`;
      return new Response(twiml, {
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
