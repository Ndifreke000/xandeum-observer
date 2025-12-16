import { useState, useEffect, useCallback, useRef } from 'react';
import { ContractAnalysis } from '@/types/contract';
import { generateFullContractAnalysis } from '@/lib/mock-contract-data';
import { validateContractAddress } from '@/lib/contract-utils';

export interface UseContractAnalysisOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // milliseconds
}

export interface UseContractAnalysisResult {
    analysis: ContractAnalysis | null;
    isLoading: boolean;
    error: string | null;
    fetchAnalysis: (address: string) => void;
    setAutoRefresh: (enabled: boolean) => void;
    setRefreshInterval: (interval: number) => void;
    lastUpdated: Date | null;
}

export function useContractAnalysis(
    initialAddress?: string,
    options: UseContractAnalysisOptions = {}
): UseContractAnalysisResult {
    const { autoRefresh = false, refreshInterval = 30000 } = options;

    const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentAddress, setCurrentAddress] = useState<string | undefined>(initialAddress);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
    const [currentRefreshInterval, setCurrentRefreshInterval] = useState(refreshInterval);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAnalysis = useCallback((address: string) => {
        // Validate address
        if (!validateContractAddress(address)) {
            setError('Invalid contract address format. Expected 44-character base58 string.');
            setAnalysis(null);
            setIsLoading(false);
            return;
        }

        setError(null);
        setIsLoading(true);
        setCurrentAddress(address);

        // Simulate network delay
        setTimeout(() => {
            try {
                // In a real implementation, this would call the pRPC service
                const contractAnalysis = generateFullContractAnalysis(address);
                setAnalysis(contractAnalysis);
                setLastUpdated(new Date());
                setError(null);
            } catch (err) {
                setError('Failed to fetch contract analysis. Please try again.');
                setAnalysis(null);
            } finally {
                setIsLoading(false);
            }
        }, 500 + Math.random() * 500); // 500-1000ms delay
    }, []);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefreshEnabled || !currentAddress) {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
            return;
        }

        // Set up auto-refresh
        refreshTimerRef.current = setInterval(() => {
            fetchAnalysis(currentAddress);
        }, currentRefreshInterval);

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        };
    }, [autoRefreshEnabled, currentAddress, currentRefreshInterval, fetchAnalysis]);

    // Initial fetch if address is provided
    useEffect(() => {
        if (initialAddress) {
            fetchAnalysis(initialAddress);
        }
    }, []); // Empty deps - only run on mount

    return {
        analysis,
        isLoading,
        error,
        fetchAnalysis,
        setAutoRefresh: setAutoRefreshEnabled,
        setRefreshInterval: setCurrentRefreshInterval,
        lastUpdated,
    };
}
