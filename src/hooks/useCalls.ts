import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

function useCallsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("calls-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calls" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["calls"] });
          queryClient.invalidateQueries({ queryKey: ["recent-calls"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useCalls() {
  useCallsRealtime();

  return useQuery({
    queryKey: ["calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("*, leads(name, phone)")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRecentCalls(limit = 5) {
  useCallsRealtime();

  return useQuery({
    queryKey: ["recent-calls", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("*, leads(name)")
        .order("started_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}
