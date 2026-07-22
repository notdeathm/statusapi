export type ServiceType = "http" | "github";

export interface Service {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: ServiceType;
  // Only for github type
  owner?: string;
  repo?: string;
  checkInterval?: number;
  timeout?: number;
}

export type StatusValue = "up" | "down" | "degraded" | "maintenance";

export interface ServiceStatus {
  serviceId: string;
  status: StatusValue;
  statusCode?: number;
  responseTime?: number;
  timestamp: string;
  lastChecked: string;
  uptime: number;
  error?: string;
}

export interface HistoryEntry {
  date: string;
  status: StatusValue;
  responseTime?: number;
  avgResponseTime?: number;
  uptime: number;
  incidents: number;
  upCount?: number;
  totalCount?: number;
}

export interface ServiceResult {
  service: Service;
  currentStatus: ServiceStatus;
  uptime30d: number;
  history?: HistoryEntry[];
}

export interface StatusData {
  success: boolean;
  timestamp: string;
  services: ServiceResult[];
  totalServices: number;
  allOperational: boolean;
  anyDown?: boolean;
  anyDegraded?: boolean;
}

export interface HistoryData {
  success: boolean;
  timestamp: string;
  services: {
    serviceId: string;
    serviceName: string;
    history: HistoryEntry[];
    overallUptime30d: number;
  }[];
}

export interface MaintenanceWindow {
  isDown: boolean;
  reason: string;
  startTime: string;
  estimatedDowntime?: string;
}

export interface MaintenanceData {
  services: Record<string, MaintenanceWindow>;
}

export interface IncidentEntry {
  id: string;
  serviceId: string;
  serviceName: string;
  status: StatusValue;
  statusCode?: number | null;
  startTime: string;
  lastSeenDown?: string;
  error?: string | null;
  // Closed incidents only
  resolvedTime?: string;
  durationMs?: number;
  resolvedStatus?: StatusValue;
}

export interface IncidentsData {
  success: boolean;
  timestamp: string;
  openIncidents: IncidentEntry[];
  closedIncidents: IncidentEntry[];
  totalIncidents: number;
}
