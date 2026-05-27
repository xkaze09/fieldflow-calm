import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHistory() {
  return useQuery({
    queryKey: ["client-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("id, from_number, to_number, started_at, lead_id, leads(name, phone, location)")
        .order("started_at", { ascending: false });
      if (error) throw error;

      // Fetch business lines for company name mapping
      const { data: businesses } = await supabase
        .from("business_lines")
        .select("phone, name");

      const bizMap = new Map<string, string>();
      if (businesses) {
        for (const b of businesses) {
          const digits = b.phone.replace(/\D/g, "");
          bizMap.set(digits, b.name);
          if (digits.startsWith("1")) bizMap.set(digits.slice(1), b.name);
        }
      }

      // Fetch jobs for appointment info
      const leadIds = [...new Set(data.filter((c) => c.lead_id).map((c) => c.lead_id!))];
      let jobsMap = new Map<string, { scheduled_at: string | null }>();
      if (leadIds.length > 0) {
        const { data: jobs } = await supabase
          .from("jobs")
          .select("lead_id, scheduled_at")
          .in("lead_id", leadIds)
          .order("scheduled_at", { ascending: false });
        if (jobs) {
          for (const j of jobs) {
            if (j.lead_id && !jobsMap.has(j.lead_id)) {
              jobsMap.set(j.lead_id, { scheduled_at: j.scheduled_at });
            }
          }
        }
      }

      return data.map((call) => {
        const toDigits = call.to_number.replace(/\D/g, "");
        const companyName = bizMap.get(toDigits) || bizMap.get(toDigits.replace(/^1/, "")) || null;
        const lead = (call as any).leads as { name: string; phone: string; location: string | null } | null;
        const job = call.lead_id ? jobsMap.get(call.lead_id) : null;

        return {
          id: call.id,
          leadId: call.lead_id,
          companyName,
          clientName: lead?.name || null,
          address: lead?.location || null,
          phone: lead?.phone || call.from_number,
          callDate: call.started_at,
          appointmentDate: job?.scheduled_at || null,
        };
      });
    },
  });
}
