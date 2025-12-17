// Node EDA Type Definitions

export type ActivityClassification = 'burst' | 'steady' | 'sporadic';
export type IOClassification = 'read-heavy' | 'write-heavy' | 'balanced';
export type PerformanceTier = 'excellent' | 'good' | 'poor';

export interface NodeIdentity {
    nodeId: string;
    ipAddress?: string;
    version?: string;
    firstSeen: string; // ISO timestamp
    lastSeen: string; // ISO timestamp
    uptimeDays: number;
    isActive: boolean;
}

export interface TimeBucket {
    timestamp: string;
    requestCount: number;
    inboundBytes: number;
    outboundBytes: number;
}

export interface TrafficDistribution {
    totalRequests: number;
    totalBytesTransferred: number;
    timeBuckets: TimeBucket[];
    classification: ActivityClassification;
    peakActivity: {
        timestamp: string;
        requestCount: number;
    };
    averageRequestsPerHour: number;
    burstPeriods: Array<{
        start: string;
        end: string;
        intensity: number; // ratio compared to average
    }>;
}

export interface IOBehavior {
    totalInbound: number;
    totalOutbound: number;
    ioRatio: number; // inbound / outbound
    classification: IOClassification;
    temporalTrend: Array<{
        timestamp: string;
        inboundRatio: number; // percentage of inbound at this time
    }>;
    recentShift: {
        direction: 'more-inbound' | 'more-outbound' | 'stable';
        magnitude: number; // percentage change
    };
}

export interface PeerInteraction {
    peerId: string;
    peerIp: string;
    interactionCount: number;
    percentage: number;
    firstInteracted: string;
    lastInteracted: string;
}

export interface PeerInteractionProfile {
    distinctPeers: number;
    loadConcentration: {
        giniCoefficient: number; // 0-1, higher = more concentrated
        top3Percentage: number;
    };
    topPeers: PeerInteraction[];
    temporalMapping: Array<{
        timestamp: string;
        peerId: string;
        interactionCount: number;
    }>;
}

export interface PerformanceSignals {
    medianLatency: number; // ms
    p95Latency: number; // ms
    p99Latency: number; // ms
    failureRate: number; // percentage 0-100
    totalFailures: number;
    retryPatterns: {
        averageRetries: number;
        maxRetries: number;
        retrySuccessRate: number; // percentage
        backoffDetected: boolean;
    };
    performanceTier: PerformanceTier;
    latencyDistribution: Array<{
        timestamp: string;
        latency: number;
        failed: boolean;
    }>;
}

export interface NodeAnalysis {
    nodeId: string;
    identity: NodeIdentity;
    traffic?: TrafficDistribution;
    io?: IOBehavior;
    peerProfile?: PeerInteractionProfile;
    performance?: PerformanceSignals;
    generatedAt: string;
}
