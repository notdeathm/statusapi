import type { StatusValue } from "@/types";

const labels: Record<StatusValue, string> = {
  up: "Operational",
  down: "Outage",
  degraded: "Degraded",
  maintenance: "Maintenance",
};

export default function StatusBadge({ status }: { status: StatusValue }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className="status-dot" />
      {labels[status]}
    </span>
  );
}
