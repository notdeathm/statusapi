'use client';

import { AlertTriangle, Clock } from 'lucide-react';

interface MaintenanceBadgeProps {
  reason: string;
  startTime: string;
  estimatedDowntime: string;
}

export function MaintenanceBadge({
  reason,
  startTime,
  estimatedDowntime,
}: MaintenanceBadgeProps) {
  const startDate = new Date(startTime);
  const timeElapsed = Math.floor(
    (Date.now() - startDate.getTime()) / 1000 / 60
  );

  return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200">
            Maintenance
          </h3>

          <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
            {reason}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Started {timeElapsed}m ago • Est. {estimatedDowntime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
