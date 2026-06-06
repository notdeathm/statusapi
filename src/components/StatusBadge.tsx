'use client';

import { getStatusColor, getStatusLabel } from '@/lib/status-checker';

interface StatusBadgeProps {
  status: 'up' | 'down' | 'degraded' | 'checking';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({
  status,
  showLabel = true,
  size = 'md',
}: StatusBadgeProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full ${sizeClasses[size]} ${status === 'checking' ? 'animate-pulse' : ''} transition-all duration-500`}
        style={{
          backgroundColor: color,
          opacity: status === 'checking' ? 0.7 : 1,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
      {showLabel && (
        <span className={`font-medium text-slate-600 dark:text-slate-300 ${textSizeClasses[size]} transition-all duration-300`}>
          {label}
        </span>
      )}
    </div>
  );
}
