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

export interface NodeAnalysis {
    nodeId: string;
    generatedAt: string;
    identity: NodeIdentityData;
    performance: NodePerformanceData;
    storage?: NodeStorageData;
}
