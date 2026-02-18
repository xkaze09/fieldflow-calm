import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useJobParts(jobId: string | null) {
  return useQuery({
    queryKey: ["job-parts", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_parts")
        .select("*, parts_catalog(name, sku, unit_price, unit_cost)")
        .eq("job_id", jobId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useAddJobPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      job_id, part_id, qty,
    }: {
      job_id: string; part_id: string; qty: number;
    }) => {
      // Get part pricing
      const { data: part } = await supabase
        .from("parts_catalog")
        .select("unit_price, unit_cost")
        .eq("id", part_id)
        .single();
      if (!part) throw new Error("Part not found");

      const { data, error } = await supabase
        .from("job_parts")
        .insert({
          job_id, part_id, qty,
          total_price: part.unit_price * qty,
          total_cost: part.unit_cost * qty,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["job-parts", vars.job_id] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useRemoveJobPart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, job_id }: { id: string; job_id: string }) => {
      const { error } = await supabase.from("job_parts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["job-parts", vars.job_id] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
