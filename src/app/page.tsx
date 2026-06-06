"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle, TrendingUp, Github } from "lucide-react";
import { StatusCard } from "@/components/StatusCard";
import { HistoryView } from "@/components/HistoryView";
import type { Service, StatusRecord } from "@/lib/types";
import type { MaintenanceNote } from "@/lib/maintenance";

interface ServiceStatus {
  service: Service;
  currentStatus: StatusRecord;
  uptime30d: number;
}

export default function Dashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [maintenance, setMaintenance] = useState<
    Record<string, MaintenanceNote>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, maintenanceRes] = await Promise.all([
        fetch("status.json"),
        fetch("maintenance.json"),
      ]);

      if (!statusRes.ok) throw new Error("Failed to fetch status");

      const statusData = await statusRes.json();

      if (statusData.success) {
        setServices(statusData.services);
        setLastUpdated(new Date());
      } else {
        throw new Error(statusData.error || "Failed to fetch status");
      }

      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json();
        if (maintenanceData.success) {
          setMaintenance(maintenanceData.data.services);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = services.every((s) => s.currentStatus.status === "up")
    ? "All Systems Operational"
    : services.some((s) => s.currentStatus.status === "down")
      ? "Some Systems Down"
      : "Degraded Performance";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Showcase Banner */}
        <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A serverless status page that monitors the health of web services and GitHub repositories.
            Automated checks every 5 minutes via GitHub Actions, powered by Next.js.
          </p>
          <a
            href="https://github.com/notdeathm/statusapi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 transition-colors"
          >
            <Github className="w-4 h-4" />
            Open source on GitHub
          </a>
        </div>

        {/* Status Summary */}
        <div className="mb-8">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  System Status
                </h1>
                <p className="text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-300">
                  {overallStatus}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchStatus}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-500 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  {showHistory ? "Dashboard" : "History"}
                </button>
              </div>
            </div>

            {lastUpdated && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* History View */}
        {showHistory && (
          <div className="mb-8">
            <HistoryView />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Error
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && services.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Services Grid */}
        {!showHistory && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ service, currentStatus, uptime30d }) => (
              <div key={service.id} className="animate-fade-in">
                <StatusCard
                  service={service}
                  status={currentStatus}
                  uptime={uptime30d}
                  maintenance={maintenance[service.id]}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && services.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No services configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
