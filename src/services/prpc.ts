import type { PNode, PNodeStatus, GeoData } from '@/types/pnode';

// Backend API base URL (Rust Server)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Seed IPs from the pRPC network
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

interface Pod {
    address?: string;
    is_public?: boolean;
    last_seen_timestamp: number;
    pubkey?: string;
    rpc_port?: number;
    storage_committed?: number;
    storage_usage_percent?: number;
    storage_used?: number;
    uptime?: number;
    version?: string;
    sourceIp?: string;
    geo?: GeoData;
    latency_ms?: number;
}

interface CreditsData {
    pubkey: string;
    credits: number;
}

/**
 * Service for interacting with Xandeum pRPC network via backend API
 */
class PRPCService {
    private creditsCache: Map<string, number> = new Map();
    private lastCreditsFetch: number = 0;

    /**
     * Fetch credits from backend proxy
     */
    private async fetchCredits(): Promise<void> {
        const now = Date.now();
        if (now - this.lastCreditsFetch < 60000) { // Cache for 1 minute
            return;
        }

        try {
            // Use local proxy to avoid CORS
            const response = await fetch(`${API_BASE_URL}/credits`);
            if (response.ok) {
                const data: CreditsData[] = await response.json();
                this.creditsCache.clear();
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        this.creditsCache.set(item.pubkey, item.credits);
                    });
                }
                this.lastCreditsFetch = now;
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        }
    }

    /**
     * Convert backend Pod to our PNode format
     */
    private convertPodToPNode(pod: Pod, rank: number): PNode {
        const now = Date.now();
        const lastSeen = pod.last_seen_timestamp ? pod.last_seen_timestamp * 1000 : now;

        const timeSinceLastSeen = now - lastSeen;

        // Determine status based on last_seen_timestamp
        let status: PNodeStatus;
        if (timeSinceLastSeen < 120000) { // Less than 2 minutes (relaxed)
            status = 'online';
        } else if (timeSinceLastSeen < 600000) { // Less than 10 minutes
            status = 'unstable';
        } else {
            status = 'offline';
        }

        // Calculate uptime percentage (uptime is in seconds from pRPC)
        const uptimeSeconds = pod.uptime || 0;
        const uptimePercentage = Math.min(100, (uptimeSeconds / (7 * 24 * 60 * 60)) * 100); // As percentage of 7 days

        const latency = pod.latency_ms || 0;

        // Health score calculation based on REAL metrics
        // Availability: Uptime
        // Responsiveness: Latency (lower is better)
        // Stability: Status

        const availability = uptimePercentage;

        // Responsiveness score: 0-100
        // < 100ms = 100
        // > 1000ms = 0
        const responsiveness = latency > 0
            ? Math.max(0, 100 - (latency / 10))
            : 0;

        const stability = status === 'online' ? 100 :
            status === 'unstable' ? 50 : 0;

        const pubkey = pod.pubkey || `pod_${pod.address || 'unknown'}`;
        const credits = this.creditsCache.get(pubkey) || 0;

        return {
            id: pubkey,
            ip: pod.address || pod.sourceIp || 'unknown',
            status,
            metrics: {
                latency: latency,
                uptime: uptimePercentage,
                lastSeen: new Date(lastSeen).toISOString(),
                responseTime: latency, // Use latency as response time
                gossipParticipation: status === 'online' ? 100 : 0, // Placeholder until we have real gossip data
            },
            health: {
                availability: Math.round(availability),
                stability: Math.round(stability),
                responsiveness: Math.round(responsiveness),
                total: Math.round((availability * 0.4 + stability * 0.35 + responsiveness * 0.25)),
            },
            storage: {
                used: pod.storage_used || 0,
                committed: pod.storage_committed || 0,
                usagePercent: pod.storage_usage_percent || 0,
            },
            version: pod.version,
            credits,
            rank,
            isPublic: pod.is_public,
            isSeed: SEED_IPS.includes((pod.address || '').split(':')[0]),
            discoveredAt: new Date(now).toISOString(), // We don't have historical discovery time yet
            sessions: [],
            signals: [],
            geo: pod.geo,
        };
    }

    /**
     * Fetch all pNodes from backend API
     */
    async getAllPNodes(): Promise<PNode[]> {
        try {
            await this.fetchCredits();

            const response = await fetch(`${API_BASE_URL}/pods`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error || 'Failed to fetch pNodes');
            }

            // Convert all pods to PNodes
            let pNodes = (data.pods || []).map((pod: Pod) => {
                // Temporary rank placeholder, will sort later
                return this.convertPodToPNode(pod, 0);
            });

            // Deduplicate nodes based on ID
            const seenIds = new Set();
            pNodes = pNodes.filter((node: PNode) => {
                if (seenIds.has(node.id)) {
                    return false;
                }
                seenIds.add(node.id);
                return true;
            });

            // Sort by credits to assign rank
            pNodes.sort((a: PNode, b: PNode) => (b.credits || 0) - (a.credits || 0));

            // Assign rank
            pNodes = pNodes.map((node: PNode, index: number) => ({
                ...node,
                rank: index + 1
            }));

            console.log(`✓ Fetched ${pNodes.length} pNodes from Rust backend`);

            return pNodes;
        } catch (error) {
            console.error('Failed to fetch pNodes from backend:', error);
            throw error;
        }
    }

    /**
     * Get stats for a specific node
     */
    async getNodeStats(ip: string): Promise<any | null> {
        return null;
    }

    /**
     * Find a specific pNode by its public key
     */
    async findPNode(pubkey: string): Promise<PNode | null> {
        try {
            await this.fetchCredits();
            const response = await fetch(`${API_BASE_URL}/node/${pubkey}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error || 'pNode not found');
            }

            return this.convertPodToPNode(data, 0);
        } catch (error) {
            console.error(`Failed to find pNode ${pubkey}:`, error);
            return null;
        }
    }

    /**
     * Fetch node history from backend
     */
    public async getNodeHistory(nodeId: string): Promise<NodeHistoryRecord[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/node/${nodeId}/history`);
            if (!response.ok) {
                throw new Error(`Failed to fetch node history: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.error) {
                console.warn(`Backend returned error for history: ${data.error}`);
                return [];
            }
            return data;
        } catch (error) {
            console.error('Error fetching node history:', error);
            return [];
        }
    }
}

export interface NodeHistoryRecord {
    timestamp: number;
    latency_ms: number | null;
    status: string | null;
}

// Export singleton instance
export const prpcService = new PRPCService();
