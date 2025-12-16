import { PNode, PNodeStatus, LatencyDataPoint, AvailabilityDataPoint, RawRPCResponse } from '@/types/pnode';

const SEED_IPS = [
  '173.212.220.65',
  '161.97.97.41',
  '192.190.136.36',
  '192.190.136.38',
  '207.244.255.1',
  '192.190.136.28',
  '192.190.136.29',
  '173.212.203.145',
];

function generateId(): string {
  return Array.from({ length: 44 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
      Math.floor(Math.random() * 62)
    ]
  ).join('');
}

function generateStatus(): PNodeStatus {
  const rand = Math.random();
  if (rand > 0.15) return 'online';
  if (rand > 0.05) return 'unstable';
  return 'offline';
}

function generateHealthScore(status: PNodeStatus) {
  const baseAvailability = status === 'online' ? 85 + Math.random() * 15 : 
                           status === 'unstable' ? 50 + Math.random() * 30 : 
                           Math.random() * 40;
  const stability = status === 'online' ? 80 + Math.random() * 20 : 
                    status === 'unstable' ? 40 + Math.random() * 30 : 
                    Math.random() * 30;
  const responsiveness = status === 'online' ? 75 + Math.random() * 25 : 
                         status === 'unstable' ? 30 + Math.random() * 40 : 
                         0;
  
  return {
    availability: Math.round(baseAvailability),
    stability: Math.round(stability),
    responsiveness: Math.round(responsiveness),
    total: Math.round((baseAvailability * 0.4 + stability * 0.35 + responsiveness * 0.25)),
  };
}

function generateSessions(count: number) {
  const sessions = [];
  let current = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    const status = generateStatus();
    const duration = Math.floor(Math.random() * 14400) + 1800; // 30min to 4hr
    const start = new Date(current);
    const end = new Date(current.getTime() + duration * 1000);
    
    sessions.push({
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      duration,
    });
    
    current = new Date(end.getTime() + Math.random() * 600000); // gap up to 10min
  }
  
  return sessions;
}

function generateSignals(status: PNodeStatus) {
  const signals = [];
  const types = ['disconnect', 'latency_spike', 'inactivity', 'gossip_dropout'] as const;
  const count = status === 'online' ? Math.floor(Math.random() * 2) : 
                status === 'unstable' ? 2 + Math.floor(Math.random() * 3) : 
                4 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    signals.push({
      type,
      severity: Math.random() > 0.6 ? 'critical' : 'warning' as const,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      message: {
        disconnect: 'Connection lost unexpectedly',
        latency_spike: 'Response time exceeded 500ms threshold',
        inactivity: 'No response for extended period',
        gossip_dropout: 'Failed to participate in gossip round',
      }[type],
    });
  }
  
  return signals;
}

export function generateMockPNodes(count: number = 50): PNode[] {
  const nodes: PNode[] = [];
  
  // First add seed nodes
  SEED_IPS.forEach((ip, index) => {
    const status = index < 6 ? 'online' : generateStatus();
    const health = generateHealthScore(status);
    
    nodes.push({
      id: generateId(),
      ip,
      status,
      metrics: {
        latency: status === 'online' ? 20 + Math.random() * 80 : 
                 status === 'unstable' ? 150 + Math.random() * 350 : 0,
        uptime: health.availability,
        lastSeen: status === 'offline' ? 
          new Date(Date.now() - Math.random() * 3600000).toISOString() :
          new Date().toISOString(),
        responseTime: status === 'online' ? 15 + Math.random() * 50 : 
                      status === 'unstable' ? 100 + Math.random() * 200 : 0,
        gossipParticipation: status === 'online' ? 90 + Math.random() * 10 : 
                             status === 'unstable' ? 50 + Math.random() * 30 : 0,
      },
      health,
      isSeed: true,
      discoveredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      sessions: generateSessions(20),
      signals: generateSignals(status),
    });
  });
  
  // Generate additional discovered nodes
  for (let i = 0; i < count - SEED_IPS.length; i++) {
    const status = generateStatus();
    const health = generateHealthScore(status);
    
    nodes.push({
      id: generateId(),
      ip: `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      status,
      metrics: {
        latency: status === 'online' ? 20 + Math.random() * 80 : 
                 status === 'unstable' ? 150 + Math.random() * 350 : 0,
        uptime: health.availability,
        lastSeen: status === 'offline' ? 
          new Date(Date.now() - Math.random() * 3600000).toISOString() :
          new Date().toISOString(),
        responseTime: status === 'online' ? 15 + Math.random() * 50 : 
                      status === 'unstable' ? 100 + Math.random() * 200 : 0,
        gossipParticipation: status === 'online' ? 90 + Math.random() * 10 : 
                             status === 'unstable' ? 50 + Math.random() * 30 : 0,
      },
      health,
      isSeed: false,
      discoveredAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      sessions: generateSessions(15),
      signals: generateSignals(status),
    });
  }
  
  return nodes;
}

export function generateLatencyHistory(nodeId: string, hours: number = 24): LatencyDataPoint[] {
  const points: LatencyDataPoint[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 100;
  
  for (let i = 0; i < 100; i++) {
    const baseLatency = 30 + Math.random() * 40;
    const isSpike = Math.random() > 0.92;
    const latency = isSpike ? baseLatency + 200 + Math.random() * 300 : baseLatency;
    
    points.push({
      timestamp: new Date(now - (100 - i) * interval).toISOString(),
      latency: Math.round(latency),
      isSpike,
    });
  }
  
  return points;
}

export function generateAvailabilityHistory(nodeId: string, days: number = 7): AvailabilityDataPoint[] {
  const points: AvailabilityDataPoint[] = [];
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / 168; // hourly for 7 days
  
  for (let i = 0; i < 168; i++) {
    const rand = Math.random();
    const status: PNodeStatus = rand > 0.1 ? 'online' : rand > 0.03 ? 'unstable' : 'offline';
    
    points.push({
      timestamp: new Date(now - (168 - i) * interval).toISOString(),
      status,
    });
  }
  
  return points;
}

export function generateRawRPCResponses(nodeId: string): RawRPCResponse[] {
  return [
    {
      timestamp: new Date().toISOString(),
      method: 'getNodeInfo',
      data: {
        version: '0.7.0',
        nodeId,
        features: ['storage', 'gossip', 'rpc'],
        network: 'mainnet',
      },
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      method: 'getHealth',
      data: {
        status: 'healthy',
        uptime: 864000,
        connections: 47,
        memoryUsage: 0.42,
        cpuUsage: 0.15,
      },
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      method: 'getGossipPeers',
      data: {
        peers: 23,
        lastGossipRound: new Date(Date.now() - 5000).toISOString(),
        messagesReceived: 1247,
        messagesSent: 1189,
      },
    },
  ];
}

export const MOCK_PNODES = generateMockPNodes(50);
