import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export function useServiceHistory(leadId: string | null) {
  return useQuery({
    queryKey: ["service-history", leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_history")
        .select("*, jobs(status, technician_id, technicians(name))")
        .eq("lead_id", leadId!)
        .order("service_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateServiceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: TablesInsert<"service_history">) => {
      const { data, error } = await supabase
        .from("service_history")
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["service-history", data.lead_id] });
    },
  });
}
