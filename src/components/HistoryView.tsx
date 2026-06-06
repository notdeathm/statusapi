"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

import { calculateUptime } from "@/lib/status-checker";
import type { StatusRecord } from "@/lib/types";

interface HistoryPageProps {
  serviceId?: string;
}

export function HistoryView({ serviceId }: HistoryPageProps) {
  const [history, setHistory] = useState<Record<string, StatusRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedService] = useState<string>(serviceId || "");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("history.json");
        if (!response.ok) return;

        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusStats = (records: StatusRecord[]) => {
    if (records.length === 0) return { up: 0, down: 0, degraded: 0 };

    return records.reduce(
      (acc, record) => {
        acc[record.status as keyof typeof acc]++;
        return acc;
      },
      { up: 0, down: 0, degraded: 0 },
    );
  };

  const displayHistory = selectedService ? history[selectedService] : [];
  const stats = getStatusStats(displayHistory);
  const uptime = calculateUptime(displayHistory, 30);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Operational
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.up}
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Downtime</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.down}
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Degraded</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.degraded}
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Uptime (30d)
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {uptime}%
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Status Timeline
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayHistory.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No history data available
              </p>
            ) : (
              displayHistory
                .slice()
                .reverse()
                .map((record, idx) => {
                  const statusColor =
                    record.status === "up"
                      ? "bg-emerald-500"
                      : record.status === "down"
                        ? "bg-red-500"
                        : "bg-amber-500";

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded bg-slate-50 dark:bg-slate-700"
                    >
                      <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {record.status.toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(record.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {record.responseTime}ms
                      </p>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
