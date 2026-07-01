"use client";

import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/Nav";
import StatusBadge from "@/components/StatusBadge";
import HistoryBars from "@/components/HistoryBars";
import UptimeBar from "@/components/UptimeBar";
import type {
  StatusData,
  HistoryData,
  MaintenanceData,
  StatusValue,
} from "@/types";
import { formatResponseTime, timeAgo } from "@/lib/config";

const BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? ""
    : "/statusapi";

export default function DashboardPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [showHistory, setShowHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [statusRes, maintRes] = await Promise.all([
        fetch(`${BASE}/status.json?t=${Date.now()}`),
        fetch(`${BASE}/maintenance.json?t=${Date.now()}`),
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

      // Try loading history (may not exist)
      try {
        const histRes = await fetch(`${BASE}/history.json?t=${Date.now()}`);
        if (histRes.ok) {
          const histJson: HistoryData = await histRes.json();
          setHistory(histJson);
        }
      } catch {
        // history.json is optional
      }
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

  // Determine overall status
  const overallStatus = (): { label: string; cls: string; sub: string } => {
    if (!status)
      return {
        label: "Loading Systems…",
        cls: "loading",
        sub: "Checking connectivity",
      };
    if (status.allOperational)
      return {
        label: "All Systems Operational",
        cls: "operational",
        sub: `Currently monitoring ${status.totalServices} services with 100% uptime.`,
      };
    const hasDown = status.services.some(
      (s) => s.currentStatus.status === "down",
    );
    if (hasDown)
      return {
        label: "Service Outage Detected",
        cls: "outage",
        sub: "Our engineers have been notified and are investigating.",
      };
    return {
      label: "Partial Degradation",
      cls: "degraded",
      sub: "Some services are experiencing higher than normal latency.",
    };
  };

  const getHistoryForService = (serviceId: string) =>
    history?.services?.find((h) => h.serviceId === serviceId)?.history;

  const overall = overallStatus();

  return (
    <>
      <Nav />
      <main>
        <div className="container">
          {/* ── HERO ─────────────────────────── */}
          <section className="hero">
            <div className={`hero-status-card ${overall.cls}`}>
              <div className="hero-status-header">
                <div className="pulse-container">
                  <span className="pulse-dot" />
                  <span className="pulse-ring" />
                </div>
                <div className="hero-status-text">
                  <h1 className="hero-title">{overall.label}</h1>
                  <p className="hero-subtitle">{overall.sub}</p>
                </div>
              </div>
            </div>

            <div className="hero-meta">
              {lastRefresh && (
                <span className="hero-meta-item">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M6 3.5V6l1.5 1.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Updated {timeAgo(lastRefresh)}
                </span>
              )}
              <span className="hero-meta-item">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    fill="currentColor"
                  />
                  <path
                    d="M6 10.5c-2.5 0-4.5-2-4.5-4.5S3.5 1.5 6 1.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5zM6 3a3 3 0 100 6 3 3 0 000-6z"
                    fill="currentColor"
                    opacity="0.4"
                  />
                </svg>
                Next refresh in {countdown}s
              </span>
            </div>
          </section>

          {/* ── TOOLBAR ──────────────────────── */}
          <div className="toolbar">
            <div className="toolbar-left">
              <span className="section-label">
                {status
                  ? `Monitoring ${status.totalServices} Services`
                  : "Services"}
              </span>
            </div>
            <div className="toolbar-actions">
              <button
                className={`btn ${showHistory ? "active" : ""}`}
                onClick={() => setShowHistory((v) => !v)}
                aria-pressed={showHistory}
              >
                <span className="btn-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </span>
                {showHistory ? "Hide History" : "Show History"}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                aria-label="Refresh status"
              >
                <span
                  className="btn-icon"
                  style={{
                    display: "inline-block",
                    animation: refreshing
                      ? "spin 0.8s linear infinite"
                      : "none",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 4v6h-6"></path>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </span>
                {refreshing ? "Refreshing..." : "Refresh Now"}
              </button>
            </div>
          </div>

          {/* ── ERROR ───────────────────────── */}
          {error && (
            <div className="error-state">
              <span>⚠</span>
              {error}
            </div>
          )}

          {/* ── LOADING ─────────────────────── */}
          {loading && !error && (
            <div className="loading-state">
              <div className="spinner" />
              Fetching service status…
            </div>
          )}

          {/* ── SERVICES ────────────────────── */}
          {!loading && !error && status && (
            <div className="services-grid">
              {status.services.map((svc) => {
                const maint = maintenance?.services?.[svc.service.id];
                const effectiveStatus: StatusValue = maint?.isDown
                  ? "maintenance"
                  : svc.currentStatus.status;

                const svcHistory = getHistoryForService(svc.service.id);

                return (
                  <div className="service-card" key={svc.service.id}>
                    <div className="service-card-left">
                      {/* Maintenance banner */}
                      {maint?.isDown && (
                        <div className="maintenance-banner">
                          <span className="maintenance-banner-icon">⚙</span>
                          <div className="maintenance-banner-content">
                            <div className="maintenance-banner-title">
                              Scheduled Maintenance
                            </div>
                            <div className="maintenance-banner-desc">
                              {maint.reason}
                              {maint.estimatedDowntime && (
                                <> · Est. downtime: {maint.estimatedDowntime}</>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="service-card-top">
                        <span className="service-name">{svc.service.name}</span>
                        <span className="service-type-badge">
                          {svc.service.type}
                        </span>
                      </div>

                      {svc.service.description && (
                        <div className="service-desc">
                          {svc.service.description}
                        </div>
                      )}

                      <div className="service-url">{svc.service.url}</div>

                      <div className="service-stats">
                        <div className="service-stat">
                          Response{" "}
                          <span className="service-stat-val">
                            {formatResponseTime(svc.currentStatus.responseTime)}
                          </span>
                        </div>
                        <div className="service-stat">
                          30d uptime{" "}
                          <span className="service-stat-val">
                            {svc.uptime30d.toFixed(2)}%
                          </span>
                        </div>
                        <div className="service-stat">
                          Last checked{" "}
                          <span className="service-stat-val">
                            {timeAgo(svc.currentStatus.lastChecked)}
                          </span>
                        </div>
                      </div>

                      {/* History bars – toggled by button */}
                      {showHistory && (
                        <>
                          <HistoryBars history={svcHistory} />
                          <UptimeBar uptime={svc.uptime30d} />
                        </>
                      )}
                    </div>

                    <div>
                      <StatusBadge status={effectiveStatus} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer>
        <div className="container">
          <div className="footer-inner">
            <span className="footer-text">
              © {new Date().getFullYear()} Status API · Made by{" "}
              <a
                href="https://notdeathm.is-a.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                NotDeath
              </a>
              {" · "}
              <a
                href="https://github.com/notdeathm/statusapi"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open source
              </a>
            </span>
            {lastRefresh && (
              <span className="footer-text">
                Last updated: {new Date(lastRefresh).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
