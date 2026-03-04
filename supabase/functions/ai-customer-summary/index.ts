import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { lead_id } = await req.json();
    if (!lead_id) {
      return new Response(JSON.stringify({ error: "Missing lead_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (!lead) {
      return new Response(JSON.stringify({ error: "Lead not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [callsRes, jobsRes, historyRes] = await Promise.all([
      supabase
        .from("calls")
        .select("status, direction, duration_seconds, started_at, from_number, to_number")
        .eq("lead_id", lead_id)
        .order("started_at", { ascending: false })
        .limit(10),
      supabase
        .from("jobs")
        .select("status, scheduled_at, total_price, location, labor_hours")
        .eq("lead_id", lead_id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("service_history")
        .select("service_date, description, total_price, notes, discount, membership")
        .eq("lead_id", lead_id)
        .order("service_date", { ascending: false })
        .limit(10),
    ]);

    const context = {
      customer: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        location: lead.location,
        status: lead.status,
        since: lead.created_at,
      },
      recentCalls: callsRes.data || [],
      jobs: jobsRes.data || [],
      serviceHistory: historyRes.data || [],
    };

    const systemPrompt = `You are a dispatcher assistant for a field service company. Generate a brief customer briefing for an agent about to call back a customer. Be concise, actionable, and highlight:
1. Who they are and their status
2. Recent call activity (missed calls, frequency)
3. Job history and any pending work
4. Service history highlights (membership, discounts, total spend)
5. Recommended talking points for the callback

Keep it under 200 words. Use bullet points. Be direct and practical.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate a callback briefing for this customer:\n\n${JSON.stringify(context, null, 2)}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const summary = aiResult.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Customer summary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
