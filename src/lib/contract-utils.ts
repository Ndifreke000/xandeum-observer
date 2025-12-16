import {
    ContractAnalysis,
    ActivityClassification,
    ReadWriteClassification,
} from '@/types/contract';

/**
 * Validate contract address format (Solana-style base58)
 */
export function validateContractAddress(address: string): boolean {
    if (!address || address.length !== 44) return false;

    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    return base58Regex.test(address);
}

/**
 * Calculate activity window in days between first and last activity
 */
export function calculateActivityWindow(firstSeen: string, lastSeen: string): number {
    const first = new Date(firstSeen).getTime();
    const last = new Date(lastSeen).getTime();
    const diffMs = last - first;
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Classify activity pattern based on coefficient of variation
 */
export function classifyActivity(
    timeBuckets: Array<{ callCount: number }>
): ActivityClassification {
    if (timeBuckets.length === 0) return 'sporadic';

    const callCounts = timeBuckets.map(b => b.callCount);
    const average = callCounts.reduce((a, b) => a + b, 0) / callCounts.length;

    if (average === 0) return 'sporadic';

    const variance = callCounts.reduce((sum, val) =>
        sum + Math.pow(val - average, 2), 0
    ) / callCounts.length;

    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / average;

    if (coefficientOfVariation > 1.5) return 'burst';
    if (coefficientOfVariation < 0.5) return 'steady';
    return 'sporadic';
}

/**
 * Classify contract as read-heavy, write-heavy, or balanced
 */
export function classifyReadWrite(readWriteRatio: number): ReadWriteClassification {
    if (readWriteRatio > 3) return 'read-heavy';
    if (readWriteRatio < 0.5) return 'write-heavy';
    return 'balanced';
}

/**
 * Calculate load concentration using Gini coefficient
 * Returns value between 0 (perfectly distributed) and 1 (completely concentrated)
 */
export function calculateLoadConcentration(
    nodeCalls: Array<{ callCount: number }>
): { giniCoefficient: number; top3Percentage: number } {
    if (nodeCalls.length === 0) return { giniCoefficient: 0, top3Percentage: 0 };

    const sortedCalls = nodeCalls.map(n => n.callCount).sort((a, b) => a - b);
    const totalCalls = sortedCalls.reduce((a, b) => a + b, 0);

    if (totalCalls === 0) return { giniCoefficient: 0, top3Percentage: 0 };

    let giniSum = 0;
    for (let i = 0; i < sortedCalls.length; i++) {
        giniSum += (2 * (i + 1) - sortedCalls.length - 1) * sortedCalls[i];
    }

    const giniCoefficient = Math.abs(
        giniSum / (sortedCalls.length * totalCalls)
    );

    // Calculate top 3 percentage
    const sortedDescending = [...sortedCalls].sort((a, b) => b - a);
    const top3Total = sortedDescending.slice(0, 3).reduce((a, b) => a + b, 0);
    const top3Percentage = (top3Total / totalCalls) * 100;

    return {
        giniCoefficient: Number(giniCoefficient.toFixed(3)),
        top3Percentage: Number(top3Percentage.toFixed(1)),
    };
}

/**
 * Detect retry patterns from failure and retry data
 */
export function detectRetryPatterns(
    attempts: Array<{ timestamp: string; failed: boolean; retryCount: number }>
): {
    averageRetries: number;
    maxRetries: number;
    retrySuccessRate: number;
    backoffDetected: boolean;
} {
    if (attempts.length === 0) {
        return {
            averageRetries: 0,
            maxRetries: 0,
            retrySuccessRate: 0,
            backoffDetected: false,
        };
    }

    const retriedAttempts = attempts.filter(a => a.retryCount > 0);
    const totalRetries = retriedAttempts.reduce((sum, a) => sum + a.retryCount, 0);
    const averageRetries = retriedAttempts.length > 0
        ? totalRetries / retriedAttempts.length
        : 0;

    const maxRetries = Math.max(...attempts.map(a => a.retryCount), 0);

    const successfulRetries = retriedAttempts.filter(a => !a.failed).length;
    const retrySuccessRate = retriedAttempts.length > 0
        ? (successfulRetries / retriedAttempts.length) * 100
        : 0;

    // Detect exponential backoff by checking time intervals between retries
    let backoffDetected = false;
    if (retriedAttempts.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < Math.min(5, retriedAttempts.length); i++) {
            const diff = new Date(retriedAttempts[i].timestamp).getTime() -
                new Date(retriedAttempts[i - 1].timestamp).getTime();
            intervals.push(diff);
        }

        // Check if intervals are increasing (indicates backoff)
        let increasing = true;
        for (let i = 1; i < intervals.length; i++) {
            if (intervals[i] < intervals[i - 1] * 1.5) {
                increasing = false;
                break;
            }
        }
        backoffDetected = increasing;
    }

    return {
        averageRetries: Number(averageRetries.toFixed(1)),
        maxRetries,
        retrySuccessRate: Number(retrySuccessRate.toFixed(1)),
        backoffDetected,
    };
}

/**
 * Format large numbers for display (e.g., 1.2K, 3.4M)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Format latency for display with appropriate unit
 */
export function formatLatency(ms: number): string {
    if (ms >= 1000) {
        return (ms / 1000).toFixed(2) + 's';
    }
    return Math.round(ms) + 'ms';
}

/**
 * Get color class for performance tier
 */
export function getPerformanceTierColor(tier: 'excellent' | 'good' | 'poor'): string {
    switch (tier) {
        case 'excellent':
            return 'text-[hsl(var(--status-online))]';
        case 'good':
            return 'text-[hsl(var(--chart-1))]';
        case 'poor':
            return 'text-[hsl(var(--status-offline))]';
    }
}

/**
 * Get color class for activity classification
 */
export function getActivityClassificationColor(classification: ActivityClassification): string {
    switch (classification) {
        case 'burst':
            return 'text-[hsl(var(--status-unstable))]';
        case 'steady':
            return 'text-[hsl(var(--status-online))]';
        case 'sporadic':
            return 'text-muted-foreground';
    }
}

/**
 * Get color class for read/write classification
 */
export function getReadWriteClassificationColor(classification: ReadWriteClassification): string {
    switch (classification) {
        case 'read-heavy':
            return 'text-[hsl(var(--chart-1))]';
        case 'write-heavy':
            return 'text-[hsl(var(--status-unstable))]';
        case 'balanced':
            return 'text-[hsl(var(--status-online))]';
    }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}
