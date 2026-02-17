import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export function useTechnicians() {
  return useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Tables<"technicians">[];
    },
  });
}

export function useCreateTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tech: TablesInsert<"technicians">) => {
      const { data, error } = await supabase.from("technicians").insert(tech).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["technicians"] }),
  });
}

export function useUpdateTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables<"technicians">>) => {
      const { data, error } = await supabase.from("technicians").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["technicians"] }),
  });
}
