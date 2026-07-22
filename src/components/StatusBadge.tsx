import type { StatusValue } from "@/types";

interface Props {
  status: StatusValue;
}

const STATUS_CONFIG: Record<StatusValue, { label: string; icon: string }> = {
  up: { label: "Operational", icon: "●" },
  down: { label: "Outage", icon: "●" },
  degraded: { label: "Degraded", icon: "●" },
  maintenance: { label: "Maintenance", icon: "●" },
};

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, icon: "●" };

  return (
    <span className={`status-badge ${status}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      {config.label}
    </span>
  );
}
