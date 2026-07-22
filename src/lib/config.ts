export const BASE_PATH = "/statusapi";

export function getJsonUrl(filename: string): string {
  // Next.js with basePath applies the base path to all static assets in the public folder,
  // even on localhost. Therefore, we must always prefix with BASE_PATH.
  return `${BASE_PATH}/${filename}?t=${Date.now()}`;
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

export function formatIncidentDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "up":
      return "var(--green)";
    case "down":
      return "var(--red)";
    case "degraded":
      return "var(--yellow)";
    case "maintenance":
      return "var(--blue)";
    default:
      return "var(--text-dim)";
  }
}

export function calcOverallUptime(
  services: { uptime30d: number }[]
): number {
  if (!services.length) return 100;
  const sum = services.reduce((acc, s) => acc + s.uptime30d, 0);
  return Math.round((sum / services.length) * 100) / 100;
}
