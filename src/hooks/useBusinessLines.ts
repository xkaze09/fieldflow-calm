import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBusinessLines() {
  return useQuery({
    queryKey: ["business-lines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_lines")
        .select("phone, name, address");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // cache for 30 min
  });
}

export function useBusinessLookup() {
  const { data } = useBusinessLines();
  const lookup = new Map<string, { name: string; address: string | null }>();
  if (data) {
    for (const line of data) {
      // Store by raw digits (strip non-digits)
      const digits = line.phone.replace(/\D/g, "");
      lookup.set(digits, { name: line.name, address: line.address });
    }
  }
  return lookup;
}

/** Given a phone number, find the matching business name */
export function matchBusiness(
  lookup: Map<string, { name: string; address: string | null }>,
  phone: string | null | undefined
): { name: string; address: string | null } | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  // Try full match first, then without leading 1
  return lookup.get(digits) || lookup.get(digits.replace(/^1/, ""));
}
