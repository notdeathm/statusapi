"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import IncidentTimeline from "@/components/IncidentTimeline";
import type { IncidentsData, StatusData } from "@/types";
import { getJsonUrl, timeAgo, formatIncidentDuration } from "@/lib/config";

type FilterType = "all" | "open" | "resolved";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentsData | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [incRes, statusRes] = await Promise.all([
        fetch(getJsonUrl("incidents.json")),
        fetch(getJsonUrl("status.json")),
      ]);
      if (incRes.ok) setIncidents(await incRes.json());
      if (statusRes.ok) setStatus(await statusRes.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const overallStatus = status?.anyDown
    ? "outage"
    : status?.anyDegraded
    ? "degraded"
    : status
    ? "operational"
    : "loading";

  const openCount = incidents?.openIncidents?.length ?? 0;
  const closedCount = incidents?.closedIncidents?.length ?? 0;
  const totalCount = incidents?.totalIncidents ?? 0;

  const allIncidents = [
    ...(incidents?.openIncidents ?? []),
    ...(incidents?.closedIncidents ?? []),
  ];

  const filteredIncidents = allIncidents.filter((inc) => {
    if (filter === "open") return !inc.resolvedTime;
    if (filter === "resolved") return !!inc.resolvedTime;
    return true;
  });

  // Total downtime
  const totalDowntimeMs = (incidents?.closedIncidents ?? [])
    .reduce((acc, inc) => acc + (inc.durationMs ?? 0), 0);

  return (
    <>
      <Nav overallStatus={overallStatus as any} />
      <div className="incidents-page">
        <div className="container">

          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">Incident History</h1>
            <p className="page-subtitle">
              A complete record of all detected outages and service disruptions.
              {incidents && ` Monitoring since the beginning of service history.`}
            </p>
          </div>

          {/* Stats row */}
          {incidents && (
            <div className="hero-stats" style={{ marginBottom: 32 }}>
              <div className="stat-card">
                <div className="stat-label">Open</div>
                <div
                  className="stat-value"
                  style={{ color: openCount > 0 ? "var(--red-bright)" : "var(--green-bright)" }}
                >
                  {openCount}
                </div>
                <div className="stat-sub">
                  {openCount > 0 ? "Active incident(s)" : "All clear"}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Resolved</div>
                <div className="stat-value" style={{ color: "var(--text)" }}>{closedCount}</div>
                <div className="stat-sub">Total resolved</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total</div>
                <div className="stat-value" style={{ color: "var(--text)" }}>{totalCount}</div>
                <div className="stat-sub">All time</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Downtime</div>
                <div
                  className="stat-value"
                  style={{
                    color: totalDowntimeMs === 0 ? "var(--green-bright)" : "var(--red-bright)",
                    fontSize: totalDowntimeMs === 0 ? 22 : 16,
                  }}
                >
                  {totalDowntimeMs === 0 ? "Zero" : formatIncidentDuration(totalDowntimeMs)}
                </div>
                <div className="stat-sub">Recorded</div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <span className="section-label">
                {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? "s" : ""}
              </span>
              <div className="filter-pills">
                {(["all", "open", "resolved"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    className={`filter-pill${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === "open" && openCount > 0 && (
                      <span style={{
                        marginLeft: 4,
                        background: "var(--red-bg)",
                        color: "var(--red-bright)",
                        border: "1px solid var(--red-border)",
                        borderRadius: "99px",
                        padding: "0 5px",
                        fontSize: 9,
                        fontWeight: 700,
                      }}>
                        {openCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="toolbar-actions">
              <button className="btn btn-primary" onClick={fetchData} aria-label="Refresh incidents">
                <span className="btn-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </span>
                Refresh
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-state" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && !error && (
            <div className="skeleton-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-card">
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-bar skeleton-title" />
                    <div className="skeleton-bar skeleton-desc" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <div className="section-block" style={{ marginTop: 8 }}>
              <IncidentTimeline incidents={filteredIncidents} />
            </div>
          )}

        </div>
      </div>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <span className="footer-text">
              © {new Date().getFullYear()} StatusAPI · Built by{" "}
              <a href="https://notdeathm.is-a.dev" target="_blank" rel="noopener noreferrer">
                NotDeath
              </a>
            </span>
            <div className="footer-links">
              <a href="https://github.com/notdeathm/statusapi" target="_blank" rel="noopener noreferrer">GitHub</a>
              <Link href="/">Dashboard</Link>
              <Link href="/api-docs">API Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
