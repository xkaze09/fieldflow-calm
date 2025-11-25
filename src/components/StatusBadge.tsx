import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Status =
  | "new"
  | "qualified"
  | "scheduled"
  | "won"
  | "lost"
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "missed"
  | "answered";

const statusConfig: Record<
  Status,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  new: { label: "New", variant: "default", className: "bg-primary text-primary-foreground" },
  qualified: { label: "Qualified", variant: "secondary", className: "bg-accent text-accent-foreground" },
  scheduled: { label: "Scheduled", variant: "secondary", className: "bg-warning text-warning-foreground" },
  won: { label: "Won", variant: "secondary", className: "bg-success text-success-foreground" },
  lost: { label: "Lost", variant: "destructive" },
  pending: { label: "Pending", variant: "outline" },
  "in-progress": { label: "In Progress", variant: "default", className: "bg-warning text-warning-foreground" },
  completed: { label: "Completed", variant: "secondary", className: "bg-success text-success-foreground" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  missed: { label: "Missed", variant: "destructive" },
  answered: { label: "Answered", variant: "secondary", className: "bg-success text-success-foreground" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
