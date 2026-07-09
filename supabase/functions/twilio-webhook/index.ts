import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Twilio Voice webhook: logs inbound calls and returns TwiML.
// Point your Twilio number's "A CALL COMES IN" webhook to this function.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const contentType = req.headers.get("content-type") || "";
    let params: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const form = new URLSearchParams(text);
      form.forEach((v, k) => (params[k] = v));
    } else if (contentType.includes("application/json")) {
      params = await req.json();
    }

    const callSid = params.CallSid;
    const from = params.From;
    const to = params.To;
    const callStatus = (params.CallStatus || "ringing").toLowerCase();
    const recordingUrl = params.RecordingUrl || null;
    const duration = params.CallDuration ? parseInt(params.CallDuration, 10) : null;

    if (callSid && from && to) {
      // Try match existing lead by phone
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", from)
        .maybeSingle();

      // Upsert the call row
      const { data: existingCall } = await supabase
        .from("calls")
        .select("id")
        .eq("twilio_sid", callSid)
        .maybeSingle();

      const statusMap: Record<string, string> = {
        ringing: "ringing",
        "in-progress": "in-progress",
        completed: "completed",
        busy: "missed",
        "no-answer": "missed",
        failed: "missed",
        canceled: "missed",
      };

      const payload: Record<string, unknown> = {
        twilio_sid: callSid,
        from_number: from,
        to_number: to,
        direction: "inbound",
        status: statusMap[callStatus] ?? "ringing",
        lead_id: existingLead?.id ?? null,
        recording_url: recordingUrl,
        duration_seconds: duration,
      };

      if (existingCall) {
        await supabase.from("calls").update(payload).eq("id", existingCall.id);
      } else {
        await supabase.from("calls").insert({
          ...payload,
          started_at: new Date().toISOString(),
        });
      }
    }

    // Return TwiML: greet the caller and record the call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Please leave a message after the beep.</Say>
  <Record maxLength="120" playBeep="true" />
</Response>`;

    return new Response(twiml, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("twilio-webhook error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>`,
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/xml" } }
    );
  }
});