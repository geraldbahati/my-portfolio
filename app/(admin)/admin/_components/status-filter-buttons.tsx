import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "pending" | "sent" | "delivered" | "failed";

interface StatusFilterButtonsProps {
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
}

export default function StatusFilterButtons({
  statusFilter,
  setStatusFilter,
}: StatusFilterButtonsProps) {
  const statuses: StatusFilter[] = ["all", "pending", "sent", "delivered", "failed"];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          onClick={() => setStatusFilter(status)}
          variant={statusFilter === status ? "default" : "outline"}
          size="sm"
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      ))}
    </div>
  );
}
