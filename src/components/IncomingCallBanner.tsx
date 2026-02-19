import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneCall, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IncomingCallBanner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Listen for realtime changes on calls table
  useEffect(() => {
    const channel = supabase
      .channel("ringing-calls-banner")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calls" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ringing-calls"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: ringingCalls } = useQuery({
    queryKey: ["ringing-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calls")
        .select("*, leads(name)")
        .eq("status", "ringing")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  if (!ringingCalls?.length) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] lg:left-64">
      {ringingCalls.map((call) => (
        <div
          key={call.id}
          className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-4 animate-pulse border-b border-primary-foreground/20"
        >
          <div className="flex items-center gap-3 min-w-0">
            <PhoneCall className="h-5 w-5 flex-shrink-0 animate-bounce" />
            <span className="font-medium truncate">
              Incoming call from{" "}
              {(call as any).leads?.name || call.from_number}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/calls")}
            >
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
