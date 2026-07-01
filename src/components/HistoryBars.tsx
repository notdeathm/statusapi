import type { HistoryEntry, StatusValue } from "@/types";

interface Props {
  history?: HistoryEntry[];
  days?: number;
}

export default function HistoryBars({ history, days = 90 }: Props) {
  // Build an array of `days` slots, newest on the right
  const bars: { status: StatusValue | "unknown"; date: string }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const entry = history?.find((h) => h.date === dateStr);
    bars.push({
      status: entry ? entry.status : "unknown",
      date: dateStr,
    });
  }

  return (
    <div className="history-bars" title={`${days}-day uptime history`}>
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`history-bar ${bar.status}`}
          title={`${bar.date}: ${bar.status === 'unknown' ? 'No Data' : bar.status}`}
        />
      ))}
    </div>
  );
}
