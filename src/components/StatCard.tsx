interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: "green" | "yellow" | "red" | "blue" | "accent" | "default";
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, color = "default", icon }: Props) {
  const colorMap = {
    green: "var(--green)",
    yellow: "var(--yellow)",
    red: "var(--red)",
    blue: "var(--blue)",
    accent: "var(--accent)",
    default: "var(--text)",
  };

  return (
    <div className="stat-card">
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-body">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value" style={{ color: colorMap[color] }}>
          {value}
        </div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
}
