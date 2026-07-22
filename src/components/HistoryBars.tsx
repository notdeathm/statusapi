"use client";

import { useState } from "react";
import type { HistoryEntry, StatusValue } from "@/types";
import { formatResponseTime } from "@/lib/config";

interface Props {
  history?: HistoryEntry[];
  days?: number;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatusLabel(status: StatusValue | "unknown"): string {
  switch (status) {
    case "up": return "Operational";
    case "down": return "Outage";
    case "degraded": return "Degraded";
    case "maintenance": return "Maintenance";
    default: return "No data";
  }
}

export default function HistoryBars({ history, days = 30 }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Build array of bars from newest → oldest (left to right = oldest first)
  const bars: {
    status: StatusValue | "unknown";
    date: string;
    avgResponseTime?: number;
    uptime?: number;
    incidents?: number;
  }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = history?.find((h) => h.date === dateStr);
    bars.push({
      status: entry ? entry.status : "unknown",
      date: dateStr,
      avgResponseTime: entry?.avgResponseTime ?? entry?.responseTime,
      uptime: entry?.uptime,
      incidents: entry?.incidents,
    });
  }

  const earliestDate = bars[0]?.date ?? "";
  const latestDate = bars[bars.length - 1]?.date ?? "";

  return (
    <div className="history-wrap">
      <div className="history-bars-header">
        <span className="history-bars-label">{formatDateShort(earliestDate)}</span>
        <span className="history-bars-label">{days} days</span>
        <span className="history-bars-label">{formatDateShort(latestDate)}</span>
      </div>
      <div className="history-bars" role="list" aria-label={`${days}-day uptime history`}>
        {bars.map((bar, i) => (
          <div
            key={i}
            className="history-bar-wrapper"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            role="listitem"
          >
            <div
              className={`history-bar ${bar.status}`}
              aria-label={`${bar.date}: ${getStatusLabel(bar.status)}`}
            />
            {/* Tooltip */}
            <div className="bar-tooltip" aria-hidden="true">
              <span className="bar-tooltip-date">{formatDateShort(bar.date)}</span>
              <span className={`bar-tooltip-status ${bar.status}`}>
                {getStatusLabel(bar.status)}
              </span>
              {bar.avgResponseTime != null && (
                <span className="bar-tooltip-rt">
                  ⚡ {formatResponseTime(bar.avgResponseTime)}
                </span>
              )}
              {bar.uptime != null && bar.status !== "unknown" && (
                <span className="bar-tooltip-rt">
                  ↑ {bar.uptime}% uptime
                </span>
              )}
              {bar.incidents != null && bar.incidents > 0 && (
                <span className="bar-tooltip-rt" style={{ color: "var(--red-bright)" }}>
                  ⚠ {bar.incidents} incident{bar.incidents !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
