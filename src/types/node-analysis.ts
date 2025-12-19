export interface NodeIdentityData {
    nodeId: string;
    ipAddress: string;
    version?: string;
    firstSeen: string;
    lastSeen: string;
    uptimeDays: number;
    isActive: boolean;
}

export interface NodePerformanceData {
    medianLatency: number;
    p95Latency: number;
    p99Latency: number;
    failureRate: number;
    totalFailures: number;
    retryPatterns: {
        averageRetries: number;
        maxRetries: number;
        retrySuccessRate: number;
        backoffDetected: boolean;
    };
    performanceTier: 'excellent' | 'good' | 'poor';
    latencyDistribution: {
        latency: number;
        timestamp: string;
        failed: boolean;
    }[];
}

export interface NodeStorageData {
    used: number;
    committed: number;
    usagePercent: number;
}

export interface NodeTrafficData {
    totalRequests: number;
    averageRequestsPerHour: number;
    classification: 'burst' | 'steady' | 'sporadic';
    timeBuckets: {
        timestamp: string;
        requestCount: number;
        inboundBytes: number;
        outboundBytes: number;
    }[];
}

export interface NodeIOData {
    totalInbound: number;
    totalOutbound: number;
    ioRatio: number;
    classification: 'inbound-heavy' | 'outbound-heavy' | 'balanced';
}

export interface NodeAnalysis {
    nodeId: string;
    generatedAt: string;
    identity: NodeIdentityData;
    performance: NodePerformanceData;
    storage?: NodeStorageData;
    traffic?: NodeTrafficData;
    io?: NodeIOData;
}
