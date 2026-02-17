import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useGoogleCalendar() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar", {
        body: null,
        method: "GET",
      });
      // Use query params approach
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=status`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (res.ok) {
        const result = await res.json();
        setConnected(result.connected);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const getAuthUrl = useCallback(async () => {
    const redirectUri = `${window.location.origin}/schedule`;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=auth-url&redirect_uri=${encodeURIComponent(redirectUri)}`,
      {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    const data = await res.json();
    return data.url;
  }, []);

  const exchangeCode = useCallback(async (code: string) => {
    const redirectUri = `${window.location.origin}/schedule`;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=exchange-code`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      }
    );
    if (res.ok) {
      setConnected(true);
      toast.success("Connected to Google Calendar!");
    } else {
      toast.error("Failed to connect to Google Calendar");
    }
  }, []);

  const syncJobs = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced ${data.synced} jobs to Google Calendar`);
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=disconnect`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      setConnected(false);
      toast.success("Disconnected from Google Calendar");
    }
  }, []);

  return { connected, loading, syncing, getAuthUrl, exchangeCode, syncJobs, disconnect, checkStatus };
}
