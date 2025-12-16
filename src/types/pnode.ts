export type PNodeStatus = 'online' | 'unstable' | 'offline';

export interface PNodeMetrics {
  latency: number; // ms
  uptime: number; // percentage 0-100
  lastSeen: string; // ISO timestamp
  responseTime: number; // ms
  gossipParticipation: number; // percentage 0-100
}

export interface PNodeHealthScore {
  total: number; // 0-100
  availability: number; // 0-100
  stability: number; // 0-100
  responsiveness: number; // 0-100
}

export interface GeoData {
  lat: number;
  lon: number;
  country: string;
  city: string;
}

export interface PNode {
  id: string;
  ip: string;
  status: PNodeStatus;
  metrics: PNodeMetrics;
  health: PNodeHealthScore;
  isSeed: boolean;
  discoveredAt: string;
  sessions: PNodeSession[];
  signals: PNodeSignal[];
  geo?: GeoData;
}

export interface PNodeSession {
  start: string;
  end: string | null;
  status: PNodeStatus;
  duration: number; // seconds
}

export interface PNodeSignal {
  type: 'disconnect' | 'latency_spike' | 'inactivity' | 'gossip_dropout';
  severity: 'warning' | 'critical';
  timestamp: string;
  message: string;
}

export interface LatencyDataPoint {
  timestamp: string;
  latency: number;
  isSpike: boolean;
}

export interface AvailabilityDataPoint {
  timestamp: string;
  status: PNodeStatus;
}

export interface RawRPCResponse {
  timestamp: string;
  method: string;
  data: Record<string, unknown>;
}
