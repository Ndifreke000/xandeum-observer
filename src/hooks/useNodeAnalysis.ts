import { useState, useEffect, useCallback, useRef } from 'react';
import { NodeAnalysis } from '@/types/node-analysis';
import { prpcService } from '@/services/prpc';

export interface UseNodeAnalysisResult {
    analysis: NodeAnalysis | null;
    isLoading: boolean;
    error: string | null;
    fetchAnalysis: (nodeId: string) => void;
    setAutoRefresh: (enabled: boolean) => void;
    setRefreshInterval: (interval: number) => void;
    lastUpdated: Date | null;
}

export function useNodeAnalysis(initialNodeId?: string): UseNodeAnalysisResult {
    const [analysis, setAnalysis] = useState<NodeAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentNodeId, setCurrentNodeId] = useState<string | undefined>(initialNodeId);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30000);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAnalysis = useCallback(async (nodeId: string) => {
        if (!nodeId) return;

        setIsLoading(true);
        setError(null);
        setCurrentNodeId(nodeId);

        try {
            // 1. Fetch real node data from backend
            const [realNode, history] = await Promise.all([
                prpcService.findPNode(nodeId),
                prpcService.getNodeHistory(nodeId)
            ]);

            if (realNode) {
                // Calculate stats from history
                const latencies = history
                    .filter(h => h.latency_ms !== null)
                    .map(h => h.latency_ms as number)
                    .sort((a, b) => a - b);

                const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
                const p99 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;
                const median = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : (realNode.metrics?.latency || 0);

                // Map history to latency distribution for chart
                // We'll use the last 20 points for the sparkline/chart
                const latencyDistribution = history
                    .slice(0, 50) // Take last 50 points
                    .reverse() // Oldest first
                    .map(h => ({
                        latency: h.latency_ms || 0,
                        timestamp: new Date(h.timestamp * 1000).toISOString(),
                        failed: h.status !== 'online'
                    }));

                const realAnalysis: NodeAnalysis = {
                    nodeId: realNode.id,
                    generatedAt: new Date().toISOString(),
                    identity: {
                        nodeId: realNode.id,
                        ipAddress: realNode.ip,
                        version: realNode.version,
                        firstSeen: realNode.discoveredAt || new Date().toISOString(),
                        lastSeen: realNode.metrics?.lastSeen || new Date().toISOString(),
                        uptimeDays: realNode.metrics?.uptime ? (realNode.metrics.uptime / 100) * 30 : 0,
                        isActive: realNode.status === 'online',
                    },
                    performance: {
                        medianLatency: median,
                        p95Latency: p95,
                        p99Latency: p99,
                        failureRate: 0,
                        totalFailures: 0,
                        retryPatterns: {
                            averageRetries: 0,
                            maxRetries: 0,
                            retrySuccessRate: 100,
                            backoffDetected: false
                        },
                        performanceTier: realNode.health?.total > 80 ? 'excellent' : realNode.health?.total > 50 ? 'good' : 'poor',
                        latencyDistribution: latencyDistribution
                    },
                    // We still don't have real traffic/IO data, so we leave them undefined to show "No Data"
                    // or we could map pings to traffic if we wanted to be "creative" but honest is better.
                };
                setAnalysis(realAnalysis);
            } else {
                setError("Node not found in network.");
                setAnalysis(null);
            }

            setLastUpdated(new Date());
        } catch (err) {
            console.error("Error fetching node analysis:", err);
            setError("Failed to fetch node analysis.");
            setAnalysis(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoRefreshEnabled && currentNodeId) {
            refreshTimerRef.current = setInterval(() => {
                fetchAnalysis(currentNodeId);
            }, refreshInterval);
        } else if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }
        return () => {
            if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
        };
    }, [autoRefreshEnabled, currentNodeId, refreshInterval, fetchAnalysis]);

    useEffect(() => {
        if (initialNodeId) fetchAnalysis(initialNodeId);
    }, [initialNodeId, fetchAnalysis]);

    return {
        analysis,
        isLoading,
        error,
        fetchAnalysis,
        setAutoRefresh: setAutoRefreshEnabled,
        setRefreshInterval,
        lastUpdated,
    };
}
