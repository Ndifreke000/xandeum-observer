import {
    ContractAnalysis,
    ContractIdentity,
    ActivityDistribution,
    ReadWriteBehavior,
    PNodeInteractionProfile,
    PerformanceSignals,
    ActivityClassification,
    ReadWriteClassification,
    PerformanceTier,
    TimeBucket,
    PNodeUsage,
    BlockDataFlow,
    TransactionFlow,
    FlowStep,
} from '@/types/contract';

// Generate a realistic contract address (Solana-style base58)
function generateContractAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return Array.from({ length: 44 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

// Generate contract identity
export function generateContractIdentity(contractAddress?: string): ContractIdentity {
    const now = Date.now();
    const daysAgo = Math.floor(Math.random() * 180) + 7; // 7-187 days ago
    const firstSeen = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const lastSeen = new Date(now - Math.random() * 24 * 60 * 60 * 1000); // within last 24h

    return {
        programId: contractAddress || generateContractAddress(),
        firstSeen: firstSeen.toISOString(),
        lastSeen: lastSeen.toISOString(),
        activityWindowDays: daysAgo,
        isActive: Math.random() > 0.2, // 80% are active
    };
}

// Generate time buckets for activity distribution
function generateTimeBuckets(hours: number = 168): TimeBucket[] {
    const buckets: TimeBucket[] = [];
    const now = Date.now();
    const interval = 60 * 60 * 1000; // 1 hour

    // Create base activity pattern
    const baselineCallsPerHour = 10 + Math.random() * 50;

    for (let i = 0; i < hours; i++) {
        const timestamp = new Date(now - (hours - i) * interval);

        // Add some variability and occasional bursts
        let callMultiplier = 0.5 + Math.random() * 1.5;

        // 10% chance of burst period
        if (Math.random() > 0.9) {
            callMultiplier *= 3 + Math.random() * 5;
        }

        const totalCalls = Math.floor(baselineCallsPerHour * callMultiplier);
        const readRatio = 0.4 + Math.random() * 0.4; // 40-80% reads

        buckets.push({
            timestamp: timestamp.toISOString(),
            callCount: totalCalls,
            readCount: Math.floor(totalCalls * readRatio),
            writeCount: Math.floor(totalCalls * (1 - readRatio)),
        });
    }

    return buckets;
}

// Classify activity pattern
function classifyActivity(buckets: TimeBucket[]): ActivityClassification {
    const callCounts = buckets.map(b => b.callCount);
    const average = callCounts.reduce((a, b) => a + b, 0) / callCounts.length;
    const stdDev = Math.sqrt(
        callCounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / callCounts.length
    );

    const coefficientOfVariation = stdDev / average;

    if (coefficientOfVariation > 1.5) return 'burst';
    if (coefficientOfVariation < 0.5) return 'steady';
    return 'sporadic';
}

// Generate activity distribution
export function generateActivityDistribution(): ActivityDistribution {
    const timeBuckets = generateTimeBuckets(168); // 7 days
    const totalCalls = timeBuckets.reduce((sum, b) => sum + b.callCount, 0);
    const classification = classifyActivity(timeBuckets);

    // Find peak activity
    const peakBucket = timeBuckets.reduce((max, b) =>
        b.callCount > max.callCount ? b : max
    );

    // Identify burst periods
    const burstPeriods = [];
    const avgCalls = totalCalls / timeBuckets.length;
    let burstStart: TimeBucket | null = null;

    for (const bucket of timeBuckets) {
        if (bucket.callCount > avgCalls * 2) {
            if (!burstStart) burstStart = bucket;
        } else if (burstStart) {
            burstPeriods.push({
                start: burstStart.timestamp,
                end: bucket.timestamp,
                intensity: bucket.callCount / avgCalls,
            });
            burstStart = null;
        }
    }

    return {
        totalCalls,
        totalStorageCalls: Math.floor(totalCalls * (0.6 + Math.random() * 0.3)), // 60-90% are storage
        timeBuckets,
        classification,
        peakActivity: {
            timestamp: peakBucket.timestamp,
            callCount: peakBucket.callCount,
        },
        averageCallsPerHour: totalCalls / timeBuckets.length,
        burstPeriods,
    };
}

// Classify read/write behavior
function classifyReadWrite(readWriteRatio: number): ReadWriteClassification {
    if (readWriteRatio > 3) return 'read-heavy';
    if (readWriteRatio < 0.5) return 'write-heavy';
    return 'balanced';
}

// Generate read/write behavior
export function generateReadWriteBehavior(
    activity: ActivityDistribution
): ReadWriteBehavior {
    const totalReads = activity.timeBuckets.reduce((sum, b) => sum + b.readCount, 0);
    const totalWrites = activity.timeBuckets.reduce((sum, b) => sum + b.writeCount, 0);
    const readWriteRatio = totalReads / totalWrites;

    // Generate temporal trend
    const temporalTrend = activity.timeBuckets.map(bucket => ({
        timestamp: bucket.timestamp,
        readRatio: (bucket.readCount / (bucket.readCount + bucket.writeCount)) * 100,
    }));

    // Calculate recent shift (last 24h vs previous 24h)
    const recentTrend = temporalTrend.slice(-24);
    const previousTrend = temporalTrend.slice(-48, -24);
    const recentAvg = recentTrend.reduce((sum, t) => sum + t.readRatio, 0) / 24;
    const previousAvg = previousTrend.reduce((sum, t) => sum + t.readRatio, 0) / 24;
    const shift = recentAvg - previousAvg;

    return {
        totalReads,
        totalWrites,
        readWriteRatio,
        classification: classifyReadWrite(readWriteRatio),
        temporalTrend,
        recentShift: {
            direction: shift > 5 ? 'more-reads' : shift < -5 ? 'more-writes' : 'stable',
            magnitude: Math.abs(shift),
        },
    };
}

// Generate pNode interaction profile
export function generatePNodeInteractionProfile(
    activity: ActivityDistribution
): PNodeInteractionProfile {
    const nodeCount = 15 + Math.floor(Math.random() * 35); // 15-50 nodes
    const nodes: PNodeUsage[] = [];

    // Generate node IDs and distribute calls using power law
    const totalCalls = activity.totalCalls;
    let remainingCalls = totalCalls;

    for (let i = 0; i < nodeCount; i++) {
        const nodeId = `node_${i.toString().padStart(3, '0')}`;
        const nodeIp = `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

        // Power law distribution: first nodes get more calls
        const callCount = i < 3
            ? Math.floor(totalCalls * (0.2 - i * 0.05))
            : Math.floor(Math.random() * (remainingCalls / (nodeCount - i)));

        remainingCalls -= callCount;

        nodes.push({
            nodeId,
            nodeIp,
            callCount,
            percentage: (callCount / totalCalls) * 100,
            firstUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastUsed: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    // Sort by call count
    nodes.sort((a, b) => b.callCount - a.callCount);

    // Calculate Gini coefficient for load concentration
    const sortedCalls = nodes.map(n => n.callCount).sort((a, b) => a - b);
    let giniSum = 0;
    for (let i = 0; i < sortedCalls.length; i++) {
        giniSum += (2 * (i + 1) - sortedCalls.length - 1) * sortedCalls[i];
    }
    const giniCoefficient = giniSum / (sortedCalls.length * sortedCalls.reduce((a, b) => a + b, 0));

    const top3Percentage = nodes.slice(0, 3).reduce((sum, n) => sum + n.percentage, 0);

    // Generate temporal mapping
    const temporalMapping = activity.timeBuckets.flatMap(bucket => {
        const callsInBucket = bucket.callCount;
        const mappings = [];

        // Distribute calls among nodes for this time bucket
        for (let i = 0; i < Math.min(5, nodes.length); i++) {
            const node = nodes[Math.floor(Math.random() * Math.min(10, nodes.length))];
            mappings.push({
                timestamp: bucket.timestamp,
                nodeId: node.nodeId,
                callCount: Math.floor(callsInBucket / 5),
            });
        }

        return mappings;
    });

    return {
        distinctPNodesUsed: nodeCount,
        loadConcentration: {
            giniCoefficient: Math.abs(giniCoefficient),
            top3Percentage,
        },
        topNodes: nodes.slice(0, 10),
        temporalMapping,
    };
}

// Determine performance tier
function determinePerformanceTier(
    medianLatency: number,
    failureRate: number
): PerformanceTier {
    if (medianLatency < 50 && failureRate < 1) return 'excellent';
    if (medianLatency < 150 && failureRate < 5) return 'good';
    return 'poor';
}

// Generate performance signals
export function generatePerformanceSignals(
    activity: ActivityDistribution
): PerformanceSignals {
    const latencyDistribution = activity.timeBuckets.map(bucket => {
        const baseLatency = 30 + Math.random() * 80;
        const isSpike = Math.random() > 0.95;
        const failed = Math.random() > 0.97;

        return {
            timestamp: bucket.timestamp,
            latency: isSpike ? baseLatency + 200 : baseLatency,
            failed,
        };
    });

    const latencies = latencyDistribution
        .filter(d => !d.failed)
        .map(d => d.latency)
        .sort((a, b) => a - b);

    const medianLatency = latencies[Math.floor(latencies.length / 2)];
    const p95Latency = latencies[Math.floor(latencies.length * 0.95)];
    const p99Latency = latencies[Math.floor(latencies.length * 0.99)];

    const totalFailures = latencyDistribution.filter(d => d.failed).length;
    const failureRate = (totalFailures / latencyDistribution.length) * 100;

    const averageRetries = 1 + Math.random() * 2;
    const retrySuccessRate = 60 + Math.random() * 35;

    return {
        medianLatency: Math.round(medianLatency),
        p95Latency: Math.round(p95Latency),
        p99Latency: Math.round(p99Latency),
        failureRate: Number(failureRate.toFixed(2)),
        totalFailures,
        retryPatterns: {
            averageRetries: Number(averageRetries.toFixed(1)),
            maxRetries: Math.floor(averageRetries * 2 + 2),
            retrySuccessRate: Number(retrySuccessRate.toFixed(1)),
            backoffDetected: Math.random() > 0.5,
        },
        performanceTier: determinePerformanceTier(medianLatency, failureRate),
        latencyDistribution,
    };
}

// Generate complete contract analysis
export function generateFullContractAnalysis(contractAddress?: string): ContractAnalysis {
    const identity = generateContractIdentity(contractAddress);
    const activity = generateActivityDistribution();
    const readWrite = generateReadWriteBehavior(activity);
    const pNodeProfile = generatePNodeInteractionProfile(activity);
    const performance = generatePerformanceSignals(activity);

    return {
        contractAddress: identity.programId,
        identity,
        activity,
        readWrite,
        pNodeProfile,
        performance,
        generatedAt: new Date().toISOString(),
    };
}

// Generate data flow visualization for a specific block
export function generateBlockDataFlow(blockNumber?: number): BlockDataFlow {
    const actualBlockNumber = blockNumber || Math.floor(Math.random() * 1000000);
    const txCount = 3 + Math.floor(Math.random() * 12); // 3-15 transactions

    const transactions: TransactionFlow[] = [];

    for (let i = 0; i < txCount; i++) {
        const operationType = Math.random() > 0.5 ? 'write' : Math.random() > 0.5 ? 'read' : 'compute';
        const stepCount = 3 + Math.floor(Math.random() * 5);
        const pNodeCount = 2 + Math.floor(Math.random() * 4);

        const pNodesInvolved = Array.from({ length: pNodeCount }, (_, idx) =>
            `node_${Math.floor(Math.random() * 50).toString().padStart(3, '0')}`
        );

        const steps: FlowStep[] = [];
        let currentTime = Date.now();

        for (let s = 0; s < stepCount; s++) {
            const latency = 5 + Math.random() * 45;
            currentTime += latency;

            steps.push({
                stepNumber: s + 1,
                timestamp: new Date(currentTime).toISOString(),
                action: ['Validate', 'Execute', 'Store', 'Propagate', 'Confirm'][s % 5],
                nodeId: pNodesInvolved[s % pNodesInvolved.length],
                dataTransferred: Math.floor(256 + Math.random() * 4096),
                latency: Math.round(latency),
            });
        }

        transactions.push({
            transactionId: generateContractAddress().substring(0, 20),
            contractAddress: generateContractAddress(),
            operationType,
            dataSize: steps.reduce((sum, step) => sum + step.dataTransferred, 0),
            pNodesInvolved,
            steps,
            duration: steps.reduce((sum, step) => sum + step.latency, 0),
        });
    }

    return {
        blockNumber: actualBlockNumber,
        blockHash: generateContractAddress(),
        timestamp: new Date().toISOString(),
        transactions,
    };
}

// Export a few pre-generated examples
export const SAMPLE_CONTRACTS = [
    generateFullContractAnalysis('TokenSwapProgramV2_abc123xyz'),
    generateFullContractAnalysis('NFTMarketplace_def456uvw'),
    generateFullContractAnalysis('LendingProtocol_ghi789rst'),
];
