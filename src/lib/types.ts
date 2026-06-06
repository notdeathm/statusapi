/**
 * Type definitions for the Status API
 */

export interface Service {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: 'http' | 'github' | 'websocket';
  checkInterval?: number;
  timeout?: number;
  owner?: string;
  repo?: string;
}

export interface StatusRecord {
  serviceId: string;
  status: 'up' | 'down' | 'degraded' | 'checking';
  statusCode?: number;
  responseTime: number;
  timestamp: string;
  lastChecked: string;
  uptime: number;
  error?: string;
}

export interface ServiceStatus {
  service: Service;
  currentStatus: StatusRecord;
  history: StatusRecord[];
  uptime30d: number;
}

export interface StatusResponse {
  timestamp: string;
  services: ServiceStatus[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
