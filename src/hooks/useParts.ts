import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export function useParts() {
  return useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts_catalog")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Tables<"parts_catalog">[];
    },
  });
}

export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (part: TablesInsert<"parts_catalog">) => {
      const { data, error } = await supabase.from("parts_catalog").insert(part).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}

export function useUpdatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Tables<"parts_catalog">>) => {
      const { data, error } = await supabase.from("parts_catalog").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}
