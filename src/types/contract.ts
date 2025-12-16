// Contract EDA Type Definitions

export type ActivityClassification = 'burst' | 'steady' | 'sporadic';
export type ReadWriteClassification = 'read-heavy' | 'write-heavy' | 'balanced';
export type PerformanceTier = 'excellent' | 'good' | 'poor';

export interface ContractIdentity {
    programId: string;
    firstSeen: string; // ISO timestamp
    lastSeen: string; // ISO timestamp
    activityWindowDays: number;
    isActive: boolean;
}

export interface TimeBucket {
    timestamp: string;
    callCount: number;
    readCount: number;
    writeCount: number;
}

export interface ActivityDistribution {
    totalCalls: number;
    totalStorageCalls: number;
    timeBuckets: TimeBucket[];
    classification: ActivityClassification;
    peakActivity: {
        timestamp: string;
        callCount: number;
    };
    averageCallsPerHour: number;
    burstPeriods: Array<{
        start: string;
        end: string;
        intensity: number; // ratio compared to average
    }>;
}

export interface ReadWriteBehavior {
    totalReads: number;
    totalWrites: number;
    readWriteRatio: number; // reads / writes
    classification: ReadWriteClassification;
    temporalTrend: Array<{
        timestamp: string;
        readRatio: number; // percentage of reads at this time
    }>;
    recentShift: {
        direction: 'more-reads' | 'more-writes' | 'stable';
        magnitude: number; // percentage change
    };
}

export interface PNodeUsage {
    nodeId: string;
    nodeIp: string;
    callCount: number;
    percentage: number;
    firstUsed: string;
    lastUsed: string;
}

export interface PNodeInteractionProfile {
    distinctPNodesUsed: number;
    loadConcentration: {
        giniCoefficient: number; // 0-1, higher = more concentrated
        top3Percentage: number;
    };
    topNodes: PNodeUsage[];
    temporalMapping: Array<{
        timestamp: string;
        nodeId: string;
        callCount: number;
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

export interface ContractAnalysis {
    contractAddress: string;
    identity: ContractIdentity;
    activity: ActivityDistribution;
    readWrite: ReadWriteBehavior;
    pNodeProfile: PNodeInteractionProfile;
    performance: PerformanceSignals;
    generatedAt: string;
}

// Data Flow Visualization Types
export interface BlockDataFlow {
    blockNumber: number;
    blockHash: string;
    timestamp: string;
    transactions: TransactionFlow[];
}

export interface TransactionFlow {
    transactionId: string;
    contractAddress: string;
    operationType: 'read' | 'write' | 'compute';
    dataSize: number; // bytes
    pNodesInvolved: string[];
    steps: FlowStep[];
    duration: number; // ms
}

export interface FlowStep {
    stepNumber: number;
    timestamp: string;
    action: string;
    nodeId: string;
    dataTransferred: number; // bytes
    latency: number; // ms
}
