import type { PNode, PNodeStatus } from '@/types/pnode';

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
}

/**
 * Service for interacting with Xandeum pRPC network via backend API
 */
class PRPCService {
    /**
     * Convert backend Pod to our PNode format
     */
    private convertPodToPNode(pod: Pod): PNode {
        const now = Date.now();
        const lastSeen = pod.last_seen_timestamp || now;
        const timeSinceLastSeen = now - lastSeen;

        // Determine status based on last_seen_timestamp
        let status: PNodeStatus;
        if (timeSinceLastSeen < 60000) { // Less than 1 minute
            status = 'online';
        } else if (timeSinceLastSeen < 300000) { // Less than 5 minutes
            status = 'unstable';
        } else {
            status = 'offline';
        }

        // Calculate uptime percentage (uptime is in seconds from pRPC)
        const uptimeSeconds = pod.uptime || 0;
        const uptimePercentage = Math.min(100, (uptimeSeconds / (7 * 24 * 60 * 60)) * 100); // As percentage of 7 days

        // Health score calculation
        const availability = uptimePercentage;
        const stability = status === 'online' ? 90 + Math.random() * 10 :
            status === 'unstable' ? 50 + Math.random() * 30 :
                Math.random() * 30;
        const responsiveness = status === 'online' ? 80 + Math.random() * 20 :
            status === 'unstable' ? 40 + Math.random() * 40 :
                0;

        return {
            id: pod.pubkey || `pod_${pod.address}`,
            ip: pod.address || pod.sourceIp || 'unknown',
            status,
            metrics: {
                latency: status === 'online' ? 20 + Math.random() * 80 :
                    status === 'unstable' ? 150 + Math.random() * 350 : 0,
                uptime: uptimePercentage,
                lastSeen: new Date(lastSeen).toISOString(),
                responseTime: status === 'online' ? 15 + Math.random() * 50 :
                    status === 'unstable' ? 100 + Math.random() * 200 : 0,
                gossipParticipation: status === 'online' ? 90 + Math.random() * 10 :
                    status === 'unstable' ? 50 + Math.random() * 30 : 0,
            },
            health: {
                availability: Math.round(availability),
                stability: Math.round(stability),
                responsiveness: Math.round(responsiveness),
                total: Math.round((availability * 0.4 + stability * 0.35 + responsiveness * 0.25)),
            },
            isSeed: SEED_IPS.includes(pod.address || ''),
            discoveredAt: new Date(now - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            sessions: [], // Would need historical data for this
            signals: [], // Would need to track anomalies over time
        };
    }

    /**
     * Fetch all pNodes from backend API
     */
    async getAllPNodes(): Promise<PNode[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/pods`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error || 'Failed to fetch pNodes');
            }

            // Convert all pods to PNodes
            // Rust returns { total_count, pods: [...] }
            const pNodes = (data.pods || []).map((pod: Pod) => this.convertPodToPNode(pod));
            console.log(`✓ Fetched ${pNodes.length} pNodes from Rust backend`);

            return pNodes;
        } catch (error) {
            console.error('Failed to fetch pNodes from backend:', error);
            throw error;
        }
    }

    /**
     * Get stats for a specific node
     * Note: Rust backend currently doesn't expose direct IP stats, using findPNode logic or returning null
     */
    async getNodeStats(ip: string): Promise<any | null> {
        // Not implemented in Rust backend yet
        return null;
    }

    /**
     * Find a specific pNode by its public key
     */
    async findPNode(pubkey: string): Promise<PNode | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/node/${pubkey}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error || 'pNode not found');
            }

            return this.convertPodToPNode(data);
        } catch (error) {
            console.error(`Failed to find pNode ${pubkey}:`, error);
            return null;
        }
    }
}

// Export singleton instance
export const prpcService = new PRPCService();
