"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import StatusBadge from "@/components/StatusBadge";
import HistoryBars from "@/components/HistoryBars";
import UptimeBar from "@/components/UptimeBar";
import ResponseSparkline from "@/components/ResponseSparkline";
import IncidentTimeline from "@/components/IncidentTimeline";
import type {
  StatusData,
  HistoryData,
  MaintenanceData,
  IncidentsData,
  StatusValue,
} from "@/types";
import {
  formatResponseTime,
  timeAgo,
  getJsonUrl,
  calcOverallUptime,
} from "@/lib/config";

type FilterType = "all" | "http" | "github";

function getErrorReason(error?: string | null, statusCode?: number | null): string | null {
  if (!error && !statusCode) return null;
  if (statusCode) {
    if (statusCode === 404) return "Page not found — the URL returned a 404 error.";
    if (statusCode === 500) return "Internal server error — the server encountered an unexpected condition.";
    if (statusCode === 502) return "Bad gateway — the upstream server returned an invalid response.";
    if (statusCode === 503) return "Service unavailable — the server is temporarily unable to handle requests.";
    if (statusCode === 504) return "Gateway timeout — the upstream server failed to respond in time.";
    if (statusCode >= 400 && statusCode < 500) return `Client error — HTTP ${statusCode} response received.`;
    if (statusCode >= 500) return `Server error — HTTP ${statusCode} response received.`;
  }
  if (error) {
    if (error === "timeout") return "Connection timed out — the server did not respond within the timeout window.";
    if (error.includes("ECONNREFUSED")) return "Connection refused — the server actively rejected the connection.";
    if (error.includes("ENOTFOUND")) return "DNS resolution failed — the hostname could not be resolved.";
    if (error.includes("ECONNRESET")) return "Connection reset — the server closed the connection unexpectedly.";
    if (error.toLowerCase().includes("cert") || error.toLowerCase().includes("ssl")) {
      return "SSL/TLS error — the certificate may be invalid or expired.";
    }
    return error;
  }
  return null;
}

function getResponseTimeClass(ms?: number | null): string {
  if (ms == null) return "";
  if (ms < 300) return "fast";
  if (ms < 1000) return "medium";
  return "slow";
}

function getAvgResponseTime(services: StatusData["services"]): number | null {
  const times = services
    .map((s) => s.currentStatus.responseTime)
    .filter((t): t is number => t != null);
  if (!times.length) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

export default function DashboardPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [incidents, setIncidents] = useState<IncidentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [showHistory, setShowHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showHistory");
      return saved === null ? true : saved === "true";
    }
    return true;
  });
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [statusRes, maintRes] = await Promise.all([
        fetch(getJsonUrl("status.json")),
        fetch(getJsonUrl("maintenance.json")),
      ]);

      if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
      const statusJson: StatusData = await statusRes.json();
      setStatus(statusJson);
      setLastRefresh(new Date().toISOString());
      setCountdown(60);

      if (maintRes.ok) {
        const maintJson: MaintenanceData = await maintRes.json();
        setMaintenance(maintJson);
      }

      try {
        const histRes = await fetch(getJsonUrl("history.json"));
        if (histRes.ok) setHistory(await histRes.json());
      } catch { /* optional */ }

      try {
        const incRes = await fetch(getJsonUrl("incidents.json"));
        if (incRes.ok) setIncidents(await incRes.json());
      } catch { /* optional */ }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(`Failed to load status data: ${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(() => fetchData(true), 60_000);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [fetchData]);

  // Overall status
  const getOverallStatus = (): "operational" | "degraded" | "outage" | "loading" => {
    if (!status) return "loading";
    if (status.anyDown) return "outage";
    if (status.anyDegraded) return "degraded";
    return "operational";
  };

  const getHeroContent = () => {
    const s = getOverallStatus();
    switch (s) {
      case "operational":
        return {
          title: "All Systems Operational",
          subtitle: `All ${status?.totalServices ?? 0} monitored services are running normally.`,
        };
      case "degraded":
        return {
          title: "Partial Degradation",
          subtitle: "Some services are experiencing higher than normal latency.",
        };
      case "outage":
        return {
          title: "Service Outage Detected",
          subtitle: "One or more services are currently unreachable. Our team has been notified.",
        };
      default:
        return {
          title: "Checking Systems…",
          subtitle: "Loading real-time status data.",
        };
    }
  };

  const getHistoryForService = (serviceId: string) =>
    history?.services?.find((h) => h.serviceId === serviceId)?.history;

  const overallStatusKey = getOverallStatus();
  const heroContent = getHeroContent();
  const overallUptime = status ? calcOverallUptime(status.services) : 100;
  const openIncidents = incidents?.openIncidents?.length ?? 0;
  const totalIncidents = incidents?.totalIncidents ?? 0;
  const avgResponseTime = status ? getAvgResponseTime(status.services) : null;

  const filteredServices = status?.services?.filter((svc) => {
    if (filter === "all") return true;
    return svc.service.type === filter;
  }) ?? [];

  // Skeleton card
  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div style={{ flex: 1 }}>
        <div className="skeleton-bar skeleton-title" />
        <div className="skeleton-bar skeleton-desc" />
        <div className="skeleton-bar skeleton-url" />
      </div>
      <div className="skeleton-bar skeleton-badge" />
    </div>
  );

  return (
    <>
      <Nav overallStatus={overallStatusKey} />
      <main>
        <div className="container">

          {/* ── HERO ─────────────────────────────────── */}
          <section className="hero">
            <div className={`hero-banner ${overallStatusKey}`}>
              <div className="hero-banner-inner">
                <div className="status-orb">
                  <div className="status-orb-core" />
                  <div className="orb-ring" />
                  <div className="orb-ring" />
                </div>
                <div className="hero-content">
                  <h1 className="hero-title">{heroContent.title}</h1>
                  <p className="hero-subtitle">{heroContent.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {status && (
              <div className="hero-stats">
                <div className="stat-card">
                  <div className="stat-label">Services</div>
                  <div className="stat-value" style={{ color: "var(--text)" }}>
                    {status.totalServices}
                  </div>
                  <div className="stat-sub">Monitored</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">30d Uptime</div>
                  <div
                    className="stat-value"
                    style={{
                      color:
                        overallUptime >= 99
                          ? "var(--green-bright)"
                          : overallUptime >= 95
                          ? "var(--yellow-bright)"
                          : "var(--red-bright)",
                    }}
                  >
                    {overallUptime.toFixed(2)}%
                  </div>
                  <div className="stat-sub">Average</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Avg Response</div>
                  <div
                    className="stat-value"
                    style={{
                      color:
                        avgResponseTime == null
                          ? "var(--text)"
                          : avgResponseTime < 300
                          ? "var(--green-bright)"
                          : avgResponseTime < 1000
                          ? "var(--yellow-bright)"
                          : "var(--red-bright)",
                    }}
                  >
                    {avgResponseTime != null ? formatResponseTime(avgResponseTime) : "—"}
                  </div>
                  <div className="stat-sub">Current</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Incidents</div>
                  <div
                    className="stat-value"
                    style={{ color: openIncidents > 0 ? "var(--red-bright)" : "var(--text)" }}
                  >
                    {openIncidents > 0 ? openIncidents : totalIncidents}
                  </div>
                  <div className="stat-sub">
                    {openIncidents > 0 ? "Active now" : "Total recorded"}
                  </div>
                </div>
              </div>
            )}

            {/* Meta chips */}
            <div className="hero-meta">
              {lastRefresh && (
                <span className="hero-meta-chip">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Updated {timeAgo(lastRefresh)}
                </span>
              )}
              <span className="hero-meta-chip">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M6 1v4l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
                </svg>
                Refresh in {countdown}s
              </span>
              <span className="hero-meta-chip">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="1" y="3" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4 3V2a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Every 5 minutes
              </span>
            </div>
          </section>

          {/* ── TOOLBAR ─────────────────────────────── */}
          <div className="toolbar">
            <div className="toolbar-left">
              <span className="section-label">
                {status ? `${filteredServices.length} of ${status.totalServices} Services` : "Services"}
              </span>
              <div className="filter-pills">
                {(["all", "http", "github"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    className={`filter-pill${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                  >
                    {f === "all" ? "All" : f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="toolbar-actions">
              <button
                className={`btn${showHistory ? " active" : ""}`}
                onClick={() => {
                  setShowHistory((v) => {
                    const next = !v;
                    if (typeof window !== "undefined") {
                      localStorage.setItem("showHistory", String(next));
                    }
                    return next;
                  });
                }}
                aria-pressed={showHistory}
              >
                <span className="btn-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
                {showHistory ? "Hide History" : "Show History"}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                aria-label="Refresh status data"
              >
                <span
                  className="btn-icon"
                  style={{
                    display: "inline-block",
                    animation: refreshing ? "spin 0.8s linear infinite" : "none",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </span>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* ── ERROR ────────────────────────────────── */}
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

          {/* ── SKELETON ─────────────────────────────── */}
          {loading && !error && (
            <div className="skeleton-grid">
              {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── SERVICES ─────────────────────────────── */}
          {!loading && !error && status && (
            <div className="services-section">
              <div className="services-grid">
                {filteredServices.map((svc) => {
                  const maint = maintenance?.services?.[svc.service.id];
                  const effectiveStatus: StatusValue = maint?.isDown
                    ? "maintenance"
                    : svc.currentStatus.status;

                  const svcHistory = getHistoryForService(svc.service.id);
                  const isDown = effectiveStatus === "down";
                  const isDegraded = effectiveStatus === "degraded";
                  const errorReason = isDown
                    ? getErrorReason(svc.currentStatus.error, svc.currentStatus.statusCode)
                    : null;
                  const rtClass = getResponseTimeClass(svc.currentStatus.responseTime);

                  return (
                    <div
                      className={`service-card status-${effectiveStatus}`}
                      key={svc.service.id}
                    >
                      {/* Maintenance banner */}
                      {maint?.isDown && (
                        <div className="maintenance-banner">
                          <span className="maintenance-banner-icon">⚙</span>
                          <div>
                            <div className="maintenance-banner-title">Scheduled Maintenance</div>
                            <div className="maintenance-banner-desc">
                              {maint.reason}
                              {maint.estimatedDowntime && (
                                <> · Est. downtime: {maint.estimatedDowntime}</>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="service-card-header">
                        <div className="service-card-meta">
                          <div className="service-card-title-row">
                            <span className="service-name">{svc.service.name}</span>
                            <span className="service-type-badge">{svc.service.type}</span>
                          </div>
                          {svc.service.description && (
                            <div className="service-desc">{svc.service.description}</div>
                          )}
                          <div className="service-url">{svc.service.url}</div>
                        </div>
                        <StatusBadge status={effectiveStatus} />
                      </div>

                      {/* Stats row */}
                      <div className="service-stats">
                        <div className="service-stat">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Response
                          <span className={`service-stat-val ${rtClass}`}>
                            {formatResponseTime(svc.currentStatus.responseTime)}
                          </span>
                        </div>
                        <span className="service-stat-sep" aria-hidden="true" />
                        <div className="service-stat">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                          </svg>
                          30d Uptime
                          <span
                            className="service-stat-val"
                            style={{
                              color:
                                svc.uptime30d >= 99
                                  ? "var(--green-bright)"
                                  : svc.uptime30d >= 95
                                  ? "var(--yellow-bright)"
                                  : "var(--red-bright)",
                            }}
                          >
                            {svc.uptime30d.toFixed(2)}%
                          </span>
                        </div>
                        <span className="service-stat-sep" aria-hidden="true" />
                        <div className="service-stat">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          Last check
                          <span className="service-stat-val">
                            {timeAgo(svc.currentStatus.lastChecked)}
                          </span>
                        </div>
                        {svc.currentStatus.statusCode && (
                          <>
                            <span className="service-stat-sep" aria-hidden="true" />
                            <div className="service-stat">
                              HTTP
                              <span
                                className="service-stat-val"
                                style={{
                                  color: svc.currentStatus.statusCode < 400
                                    ? "var(--green-bright)"
                                    : "var(--red-bright)",
                                }}
                              >
                                {svc.currentStatus.statusCode}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Sparkline */}
                      {svcHistory && svcHistory.length > 1 && (
                        <ResponseSparkline history={svcHistory} days={7} />
                      )}

                      {/* History bars */}
                      {showHistory && (
                        <>
                          <HistoryBars history={svcHistory} days={30} />
                          <UptimeBar uptime={svc.uptime30d} />
                        </>
                      )}

                      {/* Outage reason panel */}
                      {isDown && errorReason && (
                        <div className="outage-panel">
                          <div className="outage-panel-header">
                            <span className="outage-panel-icon">⚠️</span>
                            <span className="outage-panel-title">Outage Details</span>
                          </div>
                          <div className="outage-panel-body">
                            <div className="outage-panel-row">
                              <span className="outage-panel-key">Reason</span>
                              <span className="outage-panel-val">{errorReason}</span>
                            </div>
                            {svc.currentStatus.statusCode && (
                              <div className="outage-panel-row">
                                <span className="outage-panel-key">HTTP Status</span>
                                <span className="outage-panel-val error-code">
                                  {svc.currentStatus.statusCode}
                                </span>
                              </div>
                            )}
                            {svc.currentStatus.error && svc.currentStatus.error !== "timeout" && (
                              <div className="outage-panel-row">
                                <span className="outage-panel-key">Error</span>
                                <span className="outage-panel-val" style={{ wordBreak: "break-word" }}>
                                  {svc.currentStatus.error}
                                </span>
                              </div>
                            )}
                            <div className="outage-panel-row">
                              <span className="outage-panel-key">Detected</span>
                              <span className="outage-panel-val">
                                {timeAgo(svc.currentStatus.lastChecked)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Degraded panel */}
                      {isDegraded && (
                        <div className="degraded-panel">
                          <span style={{ fontSize: 14 }}>⚡</span>
                          <div>
                            <div className="degraded-panel-text">
                              High response time detected
                            </div>
                            <div className="degraded-panel-sub">
                              Response time is {formatResponseTime(svc.currentStatus.responseTime)},
                              which exceeds the normal threshold of 2,000ms.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── INCIDENTS ──────────────────────────────── */}
          {!loading && !error && incidents && (
            <div className="section-block">
              <div className="section-block-header">
                <h2 className="section-block-title">Recent Incidents</h2>
                <Link href="/incidents" className="btn" style={{ fontSize: 11 }}>
                  View all →
                </Link>
              </div>
              <IncidentTimeline
                incidents={[
                  ...(incidents.openIncidents ?? []),
                  ...(incidents.closedIncidents?.slice(0, 3) ?? []),
                ]}
              />
            </div>
          )}

        </div>
      </main>

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
              <a href="https://github.com/notdeathm/statusapi" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="/api-docs">API Docs</a>
              {lastRefresh && (
                <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--mono)" }}>
                  Updated {new Date(lastRefresh).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
