import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCalls() {
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
