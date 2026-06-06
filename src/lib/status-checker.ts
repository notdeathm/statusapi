import type { StatusRecord } from "./types";

/**
 * Check HTTP endpoint health
 */
export async function checkHttpStatus(
  serviceId: string,
  url: string,
  timeout: number = 5000,
): Promise<StatusRecord> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const isHealthy = response.status >= 200 && response.status < 400;

    return {
      serviceId,
      status: isHealthy ? "up" : response.status >= 500 ? "down" : "degraded",
      statusCode: response.status,
      responseTime,
      timestamp: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      uptime: 100,
    };
  } catch (error) {
    return {
      serviceId,
      status: "down",
      statusCode: 0,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      uptime: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check GitHub repository status
 */
export async function checkGitHubStatus(
  serviceId: string,
  owner: string,
  repo: string,
  token?: string,
): Promise<StatusRecord> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "status-api",
    };

    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        method: "GET",
        headers,
      },
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        serviceId,
        status: "down",
        statusCode: response.status,
        responseTime,
        timestamp: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        uptime: 0,
        error: `GitHub API returned ${response.status}`,
      };
    }

    const data = (await response.json()) as Record<string, unknown>;

    // Check if repo is archived
    if (data.archived) {
      return {
        serviceId,
        status: "degraded",
        statusCode: 200,
        responseTime,
        timestamp: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        uptime: 50,
        error: "Repository is archived",
      };
    }

    return {
      serviceId,
      status: "up",
      statusCode: 200,
      responseTime,
      timestamp: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      uptime: 100,
    };
  } catch (error) {
    return {
      serviceId,
      status: "down",
      statusCode: 0,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      uptime: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate uptime percentage from status records
 */
export function calculateUptime(
  records: StatusRecord[],
  days: number = 30,
): number {
  if (records.length === 0) return 100;

  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentRecords = records.filter(
    (r) => new Date(r.timestamp).getTime() > cutoffTime,
  );

  if (recentRecords.length === 0) return 100;

  const upRecords = recentRecords.filter((r) => r.status === "up").length;
  return Math.round((upRecords / recentRecords.length) * 100);
}

/**
 * Get status color based on status value
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "up":
      return "#10b981"; // emerald-500
    case "down":
      return "#ef4444"; // red-500
    case "degraded":
      return "#f59e0b"; // amber-500
    default:
      return "#6b7280"; // gray-500
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "up":
      return "Operational";
    case "down":
      return "Down";
    case "degraded":
      return "Degraded";
    case "checking":
      return "Checking...";
    default:
      return "Unknown";
  }
}

/**
 * Format response time for display
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
