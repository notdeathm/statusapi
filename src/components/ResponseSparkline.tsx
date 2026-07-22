"use client";

import type { HistoryEntry } from "@/types";

interface Props {
  history?: HistoryEntry[];
  days?: number;
  width?: number;
  height?: number;
}

export default function ResponseSparkline({
  history,
  days = 7,
  width = 120,
  height = 28,
}: Props) {
  if (!history || history.length === 0) return null;

  // Get last N days of data
  const recent = history.slice(-days);
  const values = recent
    .map((h) => h.avgResponseTime ?? h.responseTime)
    .filter((v): v is number => v != null);

  if (values.length < 2) return null;

  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - minVal) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  // Color based on avg
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const color =
    avg < 300 ? "var(--green)" : avg < 1000 ? "var(--yellow)" : "var(--red)";

  return (
    <div className="sparkline-wrap">
      <span className="sparkline-label">7d trend</span>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        aria-label={`Response time trend: avg ${Math.round(avg)}ms`}
      >
        {/* Gradient fill area */}
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill polygon */}
        <polygon
          points={`0,${height} ${polyline} ${width},${height}`}
          fill="url(#sparkGrad)"
        />
        {/* Line */}
        <polyline
          points={polyline}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End dot */}
        {points.length > 0 && (
          <circle
            cx={parseFloat(points[points.length - 1].split(",")[0])}
            cy={parseFloat(points[points.length - 1].split(",")[1])}
            r="2.5"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}
