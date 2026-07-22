"use client";

import type { IncidentEntry } from "@/types";
import { formatIncidentDuration, timeAgo } from "@/lib/config";

interface Props {
  incidents: IncidentEntry[];
}

function getErrorReason(error?: string | null, statusCode?: number | null): string {
  if (statusCode) {
    if (statusCode === 404) return "Page not found (404)";
    if (statusCode === 500) return "Internal server error (500)";
    if (statusCode === 502) return "Bad gateway (502)";
    if (statusCode === 503) return "Service unavailable (503)";
    if (statusCode === 504) return "Gateway timeout (504)";
    if (statusCode >= 400 && statusCode < 500) return `Client error (${statusCode})`;
    if (statusCode >= 500) return `Server error (${statusCode})`;
  }
  if (error) {
    if (error === "timeout") return "Connection timed out";
    if (error.includes("ECONNREFUSED")) return "Connection refused";
    if (error.includes("ENOTFOUND")) return "DNS resolution failed";
    if (error.includes("ECONNRESET")) return "Connection reset";
    if (error.includes("cert") || error.includes("SSL")) return "SSL/TLS certificate error";
    return error;
  }
  return "Unknown error";
}

export default function IncidentTimeline({ incidents }: Props) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="incidents-empty">
        <div className="incidents-empty-icon">✅</div>
        <div className="incidents-empty-text">No incidents reported</div>
        <div className="incidents-empty-sub">All systems are running smoothly.</div>
      </div>
    );
  }

  return (
    <div className="incident-list">
      {incidents.map((inc) => {
        const isOpen = !inc.resolvedTime;
        const reason = getErrorReason(inc.error, inc.statusCode);

        return (
          <div key={inc.id} className={`incident-item${isOpen ? " open" : ""}`}>
            <div className="incident-item-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span className={`incident-severity-badge ${isOpen ? "open" : "resolved"}`}>
                    <span style={{
                      display: "inline-block",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "currentColor",
                      ...(isOpen ? { animation: "badge-pulse 2s ease-in-out infinite" } : {}),
                    }} />
                    {isOpen ? "Active" : "Resolved"}
                  </span>
                  <span className="incident-title">{inc.serviceName}</span>
                </div>
                <div className="incident-meta">
                  <span>Started {timeAgo(inc.startTime)}</span>
                  {inc.resolvedTime && (
                    <>
                      <span className="incident-meta-sep">·</span>
                      <span>Resolved {timeAgo(inc.resolvedTime)}</span>
                    </>
                  )}
                  {inc.durationMs != null && (
                    <>
                      <span className="incident-meta-sep">·</span>
                      <span>Duration: {formatIncidentDuration(inc.durationMs)}</span>
                    </>
                  )}
                  {inc.statusCode && (
                    <>
                      <span className="incident-meta-sep">·</span>
                      <span style={{ color: "var(--red-bright)" }}>HTTP {inc.statusCode}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Auto-detected reason */}
            <div className="incident-reason">
              <span style={{ color: "var(--text-muted)", marginRight: 8 }}>Reason:</span>
              <span style={{ color: "var(--text-secondary)" }}>{reason}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
