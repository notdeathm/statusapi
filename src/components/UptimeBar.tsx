interface Props {
  uptime: number;
}

export default function UptimeBar({ uptime }: Props) {
  const fill = Math.max(0, Math.min(100, uptime));
  const cls = fill >= 99 ? "high" : fill >= 90 ? "mid" : "low";

  return (
    <div className="uptime-bar-wrap">
      <div className="uptime-track">
        <div
          className={`uptime-fill ${cls}`}
          style={{ width: `${fill}%` }}
          role="progressbar"
          aria-valuenow={fill}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${fill.toFixed(2)}% uptime`}
        />
      </div>
      <span className="uptime-label">{fill.toFixed(2)}% uptime</span>
    </div>
  );
}
