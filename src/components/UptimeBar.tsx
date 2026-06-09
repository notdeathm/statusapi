interface Props {
  uptime: number;
}

export default function UptimeBar({ uptime }: Props) {
  const cls =
    uptime >= 99 ? "" : uptime >= 95 ? "degraded" : "low";

  return (
    <div className="uptime-bar-wrap">
      <div className="uptime-bar-track">
        <div
          className={`uptime-bar-fill ${cls}`}
          style={{ width: `${Math.min(100, uptime)}%` }}
        />
      </div>
      <span className="uptime-label">{uptime.toFixed(2)}%</span>
    </div>
  );
}
