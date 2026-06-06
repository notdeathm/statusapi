'use client';

import { formatResponseTime } from '@/lib/status-checker';
import { formatRelativeTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { MaintenanceBadge } from './MaintenanceBadge';
import type { Service, StatusRecord } from '@/lib/types';
import type { MaintenanceNote } from '@/lib/maintenance';

interface StatusCardProps {
  service: Service;
  status: StatusRecord;
  uptime: number;
  maintenance?: MaintenanceNote | null;
}

export function StatusCard({ service, status, uptime, maintenance }: StatusCardProps) {
  // Show maintenance mode if active
  if (maintenance?.isDown) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
            {service.name}
          </h3>
          <div className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            MAINTENANCE
          </div>
        </div>

        <MaintenanceBadge
          reason={maintenance.reason || 'Maintenance Mode'}
          startTime={maintenance.startTime || new Date().toISOString()}
          estimatedDowntime={maintenance.estimatedDowntime || 'Unknown'}
        />

        {service.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            {service.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Accent bar at top with animation */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
        style={{
          backgroundColor:
            status.status === 'up'
              ? '#10b981'
              : status.status === 'down'
                ? '#ef4444'
                : '#f59e0b',
        }}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg transition-colors">
              {service.name}
            </h3>
            {service.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {service.description}
              </p>
            )}
          </div>
          <StatusBadge status={status.status} showLabel={false} size="lg" />
        </div>

        {/* Status Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Status</span>
            <StatusBadge status={status.status} showLabel size="sm" />
          </div>

          <div className="flex items-center justify-between text-sm transition-all duration-300">
            <span className="text-slate-600 dark:text-slate-400">Response Time</span>
            <span className="font-mono text-slate-900 dark:text-white transition-all">
              {formatResponseTime(status.responseTime)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Uptime (30d)</span>
            <span className="font-mono text-slate-900 dark:text-white font-semibold transition-all">
              {uptime}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Last Checked</span>
            <span className="text-slate-600 dark:text-slate-400 text-xs transition-all">
              {formatRelativeTime(status.lastChecked)}
            </span>
          </div>
        </div>

        {/* Error message if any */}
        {status.error && (
          <div className="rounded bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-700 dark:text-red-200 animate-pulse">
            {status.error}
          </div>
        )}

        {/* URL */}
        <div className="text-xs text-slate-500 dark:text-slate-500 truncate">
          {service.url}
        </div>
      </div>
    </div>
  );
}
