import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "Google Calendar credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Get OAuth URL
    if (action === "auth-url") {
      const redirectUri = url.searchParams.get("redirect_uri") || `${url.origin}/google-calendar`;
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/calendar");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", user.id);

      return new Response(JSON.stringify({ url: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Exchange code for tokens
    if (action === "exchange-code") {
      const { code, redirect_uri } = await req.json();
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return new Response(JSON.stringify({ error: "Token exchange failed", details: tokenData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      await supabaseAdmin.from("google_calendar_tokens").upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
      }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Check connection status
    if (action === "status") {
      const { data: token } = await supabaseAdmin
        .from("google_calendar_tokens")
        .select("expires_at")
        .eq("user_id", user.id)
        .single();

      return new Response(JSON.stringify({ connected: !!token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Sync jobs to Google Calendar
    if (action === "sync") {
      const { data: tokenRow } = await supabaseAdmin
        .from("google_calendar_tokens")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!tokenRow) {
        return new Response(JSON.stringify({ error: "Not connected to Google Calendar" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Refresh token if expired
      let accessToken = tokenRow.access_token;
      if (new Date(tokenRow.expires_at) < new Date()) {
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            refresh_token: tokenRow.refresh_token,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
          }),
        });
        const refreshData = await refreshRes.json();
        if (!refreshRes.ok) {
          return new Response(JSON.stringify({ error: "Token refresh failed" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        accessToken = refreshData.access_token;
        await supabaseAdmin.from("google_calendar_tokens").update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        }).eq("user_id", user.id);
      }

      // Get jobs to sync
      const { data: jobs } = await supabaseAdmin
        .from("jobs")
        .select("*, leads(name), technicians(name)")
        .not("scheduled_at", "is", null);

      if (!jobs || jobs.length === 0) {
        return new Response(JSON.stringify({ synced: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let synced = 0;
      const calendarId = tokenRow.calendar_id || "primary";

      for (const job of jobs) {
        const summary = `Job: ${(job as any).leads?.name || "Unknown"} - ${job.location || "No location"}`;
        const description = `Technician: ${(job as any).technicians?.name || "Unassigned"}\nStatus: ${job.status}\nPrice: $${job.total_price || 0}`;
        const startTime = job.scheduled_at!;
        const endTime = new Date(new Date(startTime).getTime() + (Number(job.labor_hours) || 1) * 3600000).toISOString();

        const eventBody = {
          summary,
          description,
          start: { dateTime: startTime, timeZone: "UTC" },
          end: { dateTime: endTime, timeZone: "UTC" },
        };

        if (job.google_calendar_event_id) {
          // Update existing event
          const res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${job.google_calendar_event_id}`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(eventBody),
            }
          );
          if (res.ok) synced++;
        } else {
          // Create new event
          const res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(eventBody),
            }
          );
          if (res.ok) {
            const eventData = await res.json();
            await supabaseAdmin
              .from("jobs")
              .update({ google_calendar_event_id: eventData.id })
              .eq("id", job.id);
            synced++;
          }
        }
      }

      return new Response(JSON.stringify({ synced }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Disconnect
    if (action === "disconnect") {
      await supabaseAdmin
        .from("google_calendar_tokens")
        .delete()
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Google Calendar error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
