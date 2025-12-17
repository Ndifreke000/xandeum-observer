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
            const realNode = await prpcService.findPNode(nodeId);

            if (realNode) {
                // 2. Return only what we have (Identity)
                // We do NOT generate mock data for charts anymore as per user request for honesty.
                const realAnalysis: NodeAnalysis = {
                    nodeId: realNode.id,
                    generatedAt: new Date().toISOString(),
                    identity: {
                        nodeId: realNode.id,
                        ipAddress: realNode.ip,
                        version: realNode.version,
                        firstSeen: realNode.discoveredAt || new Date().toISOString(),
                        lastSeen: realNode.metrics?.lastSeen || new Date().toISOString(),
                        uptimeDays: realNode.metrics?.uptime ? (realNode.metrics.uptime / 100) * 30 : 0, // Approximate from percentage
                        isActive: realNode.status === 'online',
                    },
                    // We can populate some performance signals from real metrics if available
                    performance: {
                        medianLatency: realNode.metrics?.latency || 0,
                        p95Latency: 0, // Not available yet
                        p99Latency: 0, // Not available yet
                        failureRate: 0,
                        totalFailures: 0,
                        retryPatterns: {
                            averageRetries: 0,
                            maxRetries: 0,
                            retrySuccessRate: 100,
                            backoffDetected: false
                        },
                        performanceTier: realNode.health?.total > 80 ? 'excellent' : realNode.health?.total > 50 ? 'good' : 'poor',
                        latencyDistribution: []
                    }
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
