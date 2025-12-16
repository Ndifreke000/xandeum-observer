import express from 'express';
import cors from 'cors';
import { PrpcClient } from 'xandeum-prpc';

const app = express();
const PORT = 3001;

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

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));

app.use(express.json());

/**
 * GET /api/pnodes
 * Fetch all pNodes from all seed IPs
 */
app.get('/api/pnodes', async (req, res) => {
    try {
        console.log('Fetching pNodes from all seed IPs...');

        const results = await Promise.allSettled(
            SEED_IPS.map(async (ip) => {
                try {
                    const client = new PrpcClient(ip, { timeout: 10000 });
                    const response = await client.getPodsWithStats();
                    console.log(`✓ Fetched ${response.pods.length} pods from ${ip}`);
                    return response.pods.map(pod => ({
                        ...pod,
                        sourceIp: ip,
                    }));
                } catch (error) {
                    console.warn(`✗ Failed to fetch from ${ip}:`, error.message);
                    return [];
                }
            })
        );

        // Flatten and deduplicate
        const allPods = [];
        const seen = new Set();

        for (const result of results) {
            if (result.status === 'fulfilled') {
                for (const pod of result.value) {
                    const key = pod.pubkey || pod.address;
                    if (key && !seen.has(key)) {
                        seen.add(key);
                        allPods.push(pod);
                    }
                }
            }
        }

        console.log(`Total unique pNodes: ${allPods.length}`);
        res.json({
            success: true,
            count: allPods.length,
            pods: allPods,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching pNodes:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/pnode/:ip/stats
 * Get stats for a specific pNode
 */
app.get('/api/pnode/:ip/stats', async (req, res) => {
    try {
        const { ip } = req.params;
        console.log(`Fetching stats for ${ip}...`);

        const client = new PrpcClient(ip, { timeout: 10000 });
        const stats = await client.getStats();

        res.json({
            success: true,
            stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(`Error fetching stats for ${req.params.ip}:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/pnode/find
 * Find a specific pNode by pubkey
 */
app.post('/api/pnode/find', async (req, res) => {
    try {
        const { pubkey } = req.body;

        if (!pubkey) {
            return res.status(400).json({
                success: false,
                error: 'pubkey is required',
            });
        }

        console.log(`Finding pNode with pubkey: ${pubkey}...`);

        const pod = await PrpcClient.findPNode(pubkey);

        res.json({
            success: true,
            pod,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(`Error finding pNode ${req.body.pubkey}:`, error);
        res.status(404).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        service: 'xandeum-prpc-api',
        version: '1.0.0',
        seedIps: SEED_IPS,
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 pRPC API Server running on http://localhost:${PORT}`);
    console.log(`📡 Monitoring ${SEED_IPS.length} seed IPs`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET  /api/health           - Health check`);
    console.log(`  GET  /api/pnodes           - Fetch all pNodes`);
    console.log(`  GET  /api/pnode/:ip/stats  - Get pNode stats`);
    console.log(`  POST /api/pnode/find       - Find pNode by pubkey\n`);
});
