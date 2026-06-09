export const BASE_PATH = "/statusapi";

export function getJsonUrl(filename: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${BASE_PATH}/${filename}`;
  }
  return `/${filename}`;
}

export function formatUptime(uptime: number): string {
  return `${uptime.toFixed(2)}%`;
}

export function formatResponseTime(ms?: number): string {
  if (ms === undefined || ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
