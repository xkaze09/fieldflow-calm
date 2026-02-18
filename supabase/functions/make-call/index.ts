const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to } = await req.json();
    if (!to) {
      return new Response(JSON.stringify({ error: "Missing 'to' phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

    // The webhook URL that Twilio will call for status updates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const statusCallback = `${supabaseUrl}/functions/v1/twilio-webhook`;

    // TwiML to connect the call to the customer after the agent picks up
    const twimlUrl = `${supabaseUrl}/functions/v1/make-call?action=twiml&customer=${encodeURIComponent(to)}&from=${encodeURIComponent(fromNumber)}`;

    // Check if this is a TwiML request from Twilio (agent answered)
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "twiml") {
      const customer = url.searchParams.get("customer")!;
      const callerId = url.searchParams.get("from")!;
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting you now.</Say>
  <Dial callerId="${callerId}">
    <Number>${customer}</Number>
  </Dial>
</Response>`;
      return new Response(twiml, {
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      });
    }

    // Step 1: Call the business phone (agent) first
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

    const body = new URLSearchParams({
      To: fromNumber, // Call the business phone first
      From: fromNumber,
      Url: twimlUrl, // When agent answers, TwiML connects to customer
      StatusCallback: statusCallback,
      StatusCallbackEvent: "initiated ringing answered completed",
    });

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio call error:", result);
      return new Response(JSON.stringify({ error: result.message }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, callSid: result.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Make call error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
