# Technical Documentation

Complete technical documentation for the Xandeum Observer platform, including architecture, implementation details, API specifications, and feature documentation.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [API Documentation](#api-documentation)
6. [Data Models](#data-models)
7. [Services Layer](#services-layer)
8. [Component Architecture](#component-architecture)
9. [State Management](#state-management)
10. [Performance Optimizations](#performance-optimizations)
11. [Security Implementation](#security-implementation)
12. [Build and Deployment](#build-and-deployment)

---

## System Architecture

### Overview

The platform follows a client-server architecture with a React-based frontend and Rust-based backend. The frontend communicates with the backend via RESTful API, which in turn integrates with the Xandeum pRPC protocol.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  TanStack    │  │   Services   │     │
│  │  Components  │──│    Query     │──│    Layer     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┴────────────────────────────────┐
│                      Rust Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Axum     │  │    SQLite    │  │    pRPC      │     │
│  │   Web Server │──│   Database   │  │  Integration │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ pRPC Protocol
┌────────────────────────────┴────────────────────────────────┐
│                    Xandeum Network                           │
│                   (pNode Gossip Protocol)                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend → Backend**: HTTP requests via Axios
2. **Backend → pRPC**: Direct protocol integration
3. **Backend → Database**: SQLx queries
4. **State Management**: TanStack Query for server state
5. **Real-time Updates**: 30-second polling interval

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.2 | Type safety |
| Vite | 5.4.21 | Build tool |
| TanStack Query | 5.62.11 | Server state management |
| React Router | 7.1.1 | Client-side routing |
| TailwindCSS | 3.4.17 | Styling |
| shadcn/ui | Latest | UI components |
| Radix UI | Latest | Headless UI primitives |
| Three.js | 0.171.0 | 3D graphics |
| react-globe.gl | 2.27.2 | Globe visualization |
| Recharts | 2.15.0 | Charts and graphs |
| date-fns | 4.1.0 | Date manipulation |
| Axios | 1.7.9 | HTTP client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | Latest stable | Backend language |
| Axum | Latest | Web framework |
| Tokio | Latest | Async runtime |
| SQLx | Latest | Database driver |
| SQLite | 3.x | Database |
| Tower | Latest | Middleware |
| Serde | Latest | Serialization |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| TypeScript Compiler | Type checking |
| Cargo | Rust package manager |
| npm | Node package manager |
| Docker | Containerization |
| Git | Version control |

---

## Project Structure

```
xandeum-observer/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                  # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── AnomalyDetectionDashboard.tsx
│   │   ├── ComparisonModal.tsx
│   │   ├── ConsensusSimulator.tsx
│   │   ├── EarningsCalculator.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GlobeVisualization.tsx
│   │   ├── Header.tsx
│   │   ├── HealthScoreBadge.tsx
│   │   ├── HistoricalCharts.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── NetworkHealthDashboard.tsx
│   │   ├── NetworkInsights.tsx
│   │   ├── NetworkOptimizationPanel.tsx
│   │   ├── NetworkSLAPanel.tsx
│   │   ├── NetworkStats.tsx
│   │   ├── NetworkTrendChart.tsx
│   │   ├── NodeFilterPanel.tsx
│   │   ├── PNodeDetail.tsx
│   │   ├── PNodeGrid.tsx
│   │   ├── PredictiveMaintenanceDashboard.tsx
│   │   ├── ReputationLeaderboard.tsx
│   │   ├── RewardOptimizationPanel.tsx
│   │   ├── SLAVerificationPanel.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Web3AlertsPanel.tsx
│   ├── pages/                   # Route pages
│   │   ├── Index.tsx           # Main dashboard
│   │   ├── AdvancedFeatures.tsx
│   │   ├── Intelligence.tsx
│   │   └── BlockNodeEDA.tsx
│   ├── services/                # Business logic layer
│   │   ├── prpc.ts             # pRPC integration
│   │   ├── anomaly-detection.ts
│   │   ├── earnings-calculator.ts
│   │   ├── health-score.ts
│   │   ├── predictive-maintenance.ts
│   │   ├── reputation.ts
│   │   ├── reward-optimization.ts
│   │   ├── sla-verification.ts
│   │   └── web3-alerts.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useBookmarks.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useNodeFilters.ts
│   │   ├── useTheme.ts
│   │   ├── useWeb3Alerts.ts
│   │   └── use-toast.ts
│   ├── utils/                   # Utility functions
│   │   └── export.ts
│   ├── types/                   # TypeScript type definitions
│   │   └── pnode.ts
│   ├── lib/                     # Library utilities
│   │   └── utils.ts
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── server-rust/                 # Rust backend
│   ├── src/
│   │   ├── main.rs             # Server entry point
│   │   └── ...
│   ├── Cargo.toml              # Rust dependencies
│   └── xandeum.db              # SQLite database
├── public/                      # Static assets
│   ├── logo.png
│   └── ...
├── dist/                        # Production build output
├── node_modules/                # Node dependencies
├── .env                         # Environment variables
├── package.json                 # Node dependencies
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind configuration
├── components.json              # shadcn/ui configuration
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # Docker image definition
├── README.md                    # Quick start guide
└── FEATURES.md                  # This file
```

---

## Core Features

### 1. Real-Time Monitoring

**Implementation**: `src/services/prpc.ts`

Integrates with Xandeum pRPC protocol to discover and monitor pNodes.

```typescript
class PRPCService {
  private baseURL: string;
  private timeout: number = 30000;

  async getAllPNodes(): Promise<PNode[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await axios.get(`${this.baseURL}/pods`, {
        signal: controller.signal
      });
      return this.transformPNodeData(response.data);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
```

**Polling Configuration**:
- Interval: 30 seconds
- Stale time: 20 seconds
- Cache time: 5 minutes
- Retry attempts: 3
- Retry delay: Exponential backoff (1s, 2s, 4s)

### 2. Health Scoring System

**Implementation**: `src/services/health-score.ts`

Composite scoring algorithm with weighted components.

```typescript
interface HealthScoreBreakdown {
  overall: number;              // 0-100
  grade: string;                // A+ to F
  trend: 'up' | 'down' | 'stable';
  components: {
    uptime: { score: number; weight: number; value: number };
    health: { score: number; weight: number; value: number };
    storage: { score: number; weight: number; value: number };
    latency: { score: number; weight: number; value: number };
    contribution: { score: number; weight: number; value: number };
  };
}

const DEFAULT_WEIGHTS = {
  uptime: 0.30,
  health: 0.25,
  storage: 0.20,
  latency: 0.15,
  contribution: 0.10
};
```

**Calculation**:
```
Overall Score = Σ(Component Score × Weight)
```

**Component Calculations**:

1. **Uptime**: Direct mapping (99% = 99 points)
2. **Health**: Direct mapping from health.total
3. **Storage**: Optimal at 60-80% utilization
4. **Latency**: Tiered scoring (<50ms=100, 50-100ms=90-100, etc.)
5. **Contribution**: Credits + storage provided

### 3. Advanced Filtering

**Implementation**: `src/hooks/useNodeFilters.ts`

Multi-dimensional filtering with preset configurations.

```typescript
interface NodeFilters {
  search: string;
  status: string[];
  regions: string[];
  healthScoreMin: number;
  healthScoreMax: number;
  uptimeMin: number;
  latencyMax: number;
  storageMin: number;
  versions: string[];
  sortBy: 'healthScore' | 'uptime' | 'latency' | 'storage' | 'credits' | 'name';
  sortOrder: 'asc' | 'desc';
}
```

**Filter Logic**:
- Text search: Case-insensitive substring match
- Multi-select: OR logic (any match)
- Range filters: Inclusive bounds
- Sorting: Stable sort algorithm

**Presets**:
```typescript
const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'top-performers',
    filters: { healthScoreMin: 90, uptimeMin: 99, status: ['online'] }
  },
  // ... more presets
];
```

### 4. Earnings Calculator

**Implementation**: `src/services/earnings-calculator.ts`

ROI calculation engine with network data integration.

```typescript
interface EarningsCalculation {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  breakEvenDays: number;
  roi: number;
}

function calculateEarnings(
  config: NodeConfiguration,
  costs: OperatorCosts,
  networkNodes: PNode[]
): EarningsCalculation {
  const baseRate = calculateNetworkAverages(networkNodes).avgCreditsPerGB;
  const multipliers = {
    uptime: config.uptime / 100,
    latency: calculateLatencyMultiplier(config.latency),
    storage: calculateStorageMultiplier(config.storageGB)
  };
  
  const dailyEarnings = 
    config.storageGB * 
    baseRate * 
    multipliers.uptime * 
    multipliers.latency * 
    multipliers.storage;
  
  // ... profit and ROI calculations
}
```

**Multiplier Functions**:
- Latency: Tiered (1.2x for <50ms, 1.1x for <100ms, etc.)
- Storage: Economies of scale (1.15x for 2TB+, 1.1x for 1TB+, etc.)

### 5. Consensus Simulator

**Implementation**: `src/components/ConsensusSimulator.tsx`

Byzantine Fault Tolerant consensus visualization.

```typescript
interface SimulatorNode {
  id: number;
  state: 'follower' | 'candidate' | 'leader' | 'failed';
  term: number;
  votedFor: number | null;
  votes: number;
  value: number | null;
  connections: number[];
}

// Leader election
function startElection(nodeId: number) {
  nodes[nodeId].state = 'candidate';
  nodes[nodeId].term++;
  nodes[nodeId].votedFor = nodeId;
  nodes[nodeId].votes = 1;
  
  // Request votes from connected nodes
  nodes[nodeId].connections.forEach(connId => {
    if (canVote(connId, nodes[nodeId].term)) {
      nodes[nodeId].votes++;
    }
  });
  
  // Check for majority
  if (nodes[nodeId].votes > totalNodes / 2) {
    nodes[nodeId].state = 'leader';
  }
}
```

**Algorithm**:
- Leader election: Raft-inspired
- Consensus: 2/3 majority voting
- Fault tolerance: (n-1)/3 failures
- Recovery: 3s detection, 1s recovery

### 6. SLA Verification

**Implementation**: `src/services/sla-verification.ts`

On-chain storage proof verification.

```typescript
interface SLAMetrics {
  uptime: number;        // Target: 99.9%
  latency: number;       // Target: <200ms
  proofRate: number;     // Target: 95%
  reliability: number;   // Target: 99.5%
}

interface SLAViolation {
  metric: string;
  severity: 'minor' | 'major' | 'critical';
  threshold: number;
  actual: number;
  timestamp: Date;
}

function verifySLA(node: PNode): SLAVerification {
  const violations: SLAViolation[] = [];
  
  if (node.metrics.uptime < 99.9) {
    violations.push({
      metric: 'uptime',
      severity: calculateSeverity(node.metrics.uptime, 99.9),
      threshold: 99.9,
      actual: node.metrics.uptime,
      timestamp: new Date()
    });
  }
  
  // ... check other metrics
  
  return {
    compliant: violations.length === 0,
    violations,
    score: calculateComplianceScore(violations)
  };
}
```

### 7. Web3 Alerts

**Implementation**: `src/services/web3-alerts.ts`

Multi-channel alerting system.

```typescript
interface Alert {
  type: 'node_offline' | 'high_latency' | 'storage_full' | 'sla_violation';
  severity: 'info' | 'warning' | 'critical';
  nodeId: string;
  message: string;
  timestamp: Date;
}

interface AlertChannel {
  type: 'xmtp' | 'telegram' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

async function sendAlert(alert: Alert, channels: AlertChannel[]) {
  const promises = channels
    .filter(ch => ch.enabled)
    .map(ch => {
      switch (ch.type) {
        case 'telegram':
          return sendTelegramAlert(alert, ch.config);
        case 'xmtp':
          return sendXMTPAlert(alert, ch.config);
        case 'webhook':
          return sendWebhookAlert(alert, ch.config);
      }
    });
  
  await Promise.allSettled(promises);
}
```

**Telegram Integration**:
```typescript
async function sendTelegramAlert(alert: Alert, config: any) {
  const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
  await axios.post(url, {
    chat_id: config.chatId,
    text: formatAlertMessage(alert),
    parse_mode: 'Markdown'
  });
}
```

---

## API Documentation

### Backend Endpoints

#### GET /pods

Returns list of all discovered pNodes.

**Response**:
```json
[
  {
    "id": "string",
    "address": "string",
    "status": "online" | "unstable" | "offline",
    "health": {
      "total": number,
      "cpu": number,
      "memory": number,
      "disk": number
    },
    "storage": {
      "used": number,
      "committed": number
    },
    "metrics": {
      "uptime": number,
      "latency": number,
      "lastSeen": "ISO8601"
    },
    "geo": {
      "country": "string",
      "city": "string",
      "lat": number,
      "lon": number
    },
    "version": "string",
    "credits": number
  }
]
```

#### GET /pod/:id

Returns details for specific pNode.

**Parameters**:
- `id`: Node identifier

**Response**: Same as single pod object above

#### GET /network/stats

Returns aggregated network statistics.

**Response**:
```json
{
  "totalNodes": number,
  "onlineNodes": number,
  "avgHealth": number,
  "totalStorage": number,
  "avgLatency": number,
  "regions": {
    "country": number
  }
}
```

#### GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "ISO8601"
}
```

---

## Data Models

### PNode Type Definition

```typescript
interface PNode {
  id: string;
  address: string;
  ip: string;
  port: number;
  status: 'online' | 'unstable' | 'offline';
  health: {
    total: number;
    cpu: number;
    memory: number;
    disk: number;
  };
  storage: {
    used: number;
    committed: number;
  };
  metrics: {
    uptime: number;
    latency: number;
    lastSeen: Date;
  };
  geo: {
    country: string;
    city: string;
    lat: number;
    lon: number;
  };
  version: string;
  credits: number;
  rank?: number;
}
```

### Database Schema

```sql
CREATE TABLE pnodes (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  ip TEXT,
  port INTEGER,
  status TEXT NOT NULL,
  health_total INTEGER,
  health_cpu INTEGER,
  health_memory INTEGER,
  health_disk INTEGER,
  storage_used INTEGER,
  storage_committed INTEGER,
  uptime REAL,
  latency INTEGER,
  last_seen TIMESTAMP,
  country TEXT,
  city TEXT,
  latitude REAL,
  longitude REAL,
  version TEXT,
  credits INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON pnodes(status);
CREATE INDEX idx_country ON pnodes(country);
CREATE INDEX idx_last_seen ON pnodes(last_seen);
```

---

## Services Layer

### Service Architecture

Each service module encapsulates specific business logic:

```typescript
// Service pattern
export class ServiceName {
  private config: ServiceConfig;
  
  constructor(config: ServiceConfig) {
    this.config = config;
  }
  
  public async operation(): Promise<Result> {
    // Implementation
  }
  
  private helperMethod(): void {
    // Internal logic
  }
}
```

### Service Modules

1. **prpc.ts**: pRPC protocol integration
2. **health-score.ts**: Health scoring algorithm
3. **earnings-calculator.ts**: ROI calculations
4. **anomaly-detection.ts**: Statistical anomaly detection
5. **reputation.ts**: Reputation scoring
6. **predictive-maintenance.ts**: Predictive analytics
7. **reward-optimization.ts**: Optimization recommendations
8. **sla-verification.ts**: SLA compliance checking
9. **web3-alerts.ts**: Multi-channel alerting

---

## Component Architecture

### Component Hierarchy

```
App
├── ErrorBoundary
│   └── Router
│       ├── Header
│       └── Routes
│           ├── Index (Main Dashboard)
│           │   ├── NetworkStats
│           │   ├── NetworkInsights
│           │   ├── NetworkTrendChart
│           │   ├── EarningsCalculator
│           │   ├── HistoricalCharts
│           │   ├── Leaderboard
│           │   ├── GlobeVisualization
│           │   ├── PNodeGrid
│           │   │   └── HealthScoreBadge
│           │   ├── PNodeDetail
│           │   └── ComparisonModal
│           ├── AdvancedFeatures
│           │   ├── ConsensusSimulator
│           │   ├── NetworkSLAPanel
│           │   ├── Web3AlertsPanel
│           │   └── RewardOptimizationPanel
│           └── Intelligence
│               ├── AnomalyDetectionDashboard
│               ├── ReputationLeaderboard
│               └── PredictiveMaintenanceDashboard
```

### Component Patterns

**Container Components**:
```typescript
// Handles data fetching and state
export function Container() {
  const { data, isLoading } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData
  });
  
  if (isLoading) return <Loading />;
  return <Presentation data={data} />;
}
```

**Presentation Components**:
```typescript
// Pure UI rendering
interface Props {
  data: Data;
  onAction: () => void;
}

export function Presentation({ data, onAction }: Props) {
  return <div>{/* UI */}</div>;
}
```

---

## State Management

### TanStack Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20000,           // 20 seconds
      gcTime: 300000,             // 5 minutes
      refetchInterval: 30000,     // 30 seconds
      retry: 3,
      retryDelay: (attemptIndex) => 
        Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

### Query Keys

```typescript
// Query key structure
const queryKeys = {
  pnodes: ['pnodes'] as const,
  pnode: (id: string) => ['pnode', id] as const,
  networkStats: ['network', 'stats'] as const
};
```

### Custom Hooks

```typescript
// useNodeFilters
export function useNodeFilters(nodes: PNode[]) {
  const [filters, setFilters] = useState<NodeFilters>(DEFAULT_FILTERS);
  
  const filteredNodes = useMemo(() => {
    return applyFilters(nodes, filters);
  }, [nodes, filters]);
  
  return { filteredNodes, filters, updateFilter, resetFilters };
}
```

---

## Performance Optimizations

### Code Splitting

```typescript
// Route-based code splitting
const AdvancedFeatures = lazy(() => import('./pages/AdvancedFeatures'));
const Intelligence = lazy(() => import('./pages/Intelligence'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/advanced" element={<AdvancedFeatures />} />
    <Route path="/intelligence" element={<Intelligence />} />
  </Routes>
</Suspense>
```

### Memoization

```typescript
// Expensive calculations
const healthScore = useMemo(() => 
  calculateHealthScore(node), 
  [node]
);

// Stable callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Component memoization
export const ExpensiveComponent = memo(({ data }: Props) => {
  return <div>{/* render */}</div>;
});
```

### Virtual Scrolling

```typescript
// For large lists (not currently implemented, but recommended)
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100
});
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

**Current Bundle Sizes**:
- Main bundle: ~1MB
- Globe vendor: ~1.8MB
- Chart vendor: ~424KB
- React vendor: ~162KB

---

## Security Implementation

### Input Validation

```typescript
// Sanitize user input
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 100);
}
```

### API Security

```typescript
// Request timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

// CORS configuration (backend)
let cors = CorsLayer::new()
    .allow_origin(Any)
    .allow_methods([Method::GET, Method::POST])
    .allow_headers(Any);
```

### Environment Variables

```typescript
// Never expose secrets in frontend
const API_URL = import.meta.env.VITE_API_URL;

// Backend secrets
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
```

---

## Build and Deployment

### Development Build

```bash
npm run dev
# Starts Vite dev server on port 5173
# Hot module replacement enabled
# Source maps enabled
```

### Production Build

```bash
npm run build
# Output: dist/
# Minification: enabled
# Tree shaking: enabled
# Source maps: disabled
# Chunk splitting: automatic
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
          'chart-vendor': ['recharts'],
          'globe-vendor': ['three', 'react-globe.gl']
        }
      }
    }
  }
});
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration

```bash
# .env.production
VITE_API_URL=https://api.production.com
```

---

## Testing

### Unit Tests

```typescript
// Example test structure (not currently implemented)
describe('calculateHealthScore', () => {
  it('should calculate correct score', () => {
    const node = createMockNode();
    const score = calculateHealthScore(node);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

```typescript
// API integration test
describe('pRPC Service', () => {
  it('should fetch all pNodes', async () => {
    const nodes = await prpcService.getAllPNodes();
    expect(Array.isArray(nodes)).toBe(true);
  });
});
```

---

## Monitoring and Logging

### Error Tracking

```typescript
// Error boundary implementation
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to error tracking service
  }
}
```

### Performance Monitoring

```typescript
// Performance marks
performance.mark('data-fetch-start');
await fetchData();
performance.mark('data-fetch-end');
performance.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');
```

---

## API Rate Limiting

### Backend Implementation

```rust
// Rate limiting middleware (example)
use tower::limit::RateLimitLayer;

let rate_limit = RateLimitLayer::new(
    100,                    // requests
    Duration::from_secs(60) // per minute
);
```

---

## Database Migrations

### Migration Scripts

```sql
-- migrations/001_initial_schema.sql
CREATE TABLE IF NOT EXISTS pnodes (
  -- schema definition
);

-- migrations/002_add_indexes.sql
CREATE INDEX IF NOT EXISTS idx_status ON pnodes(status);
```

---

## Troubleshooting

### Common Issues

**Build Failures**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Type Errors**:
```bash
# Run type checker
npm run type-check
```

**API Connection Issues**:
```bash
# Verify backend is running
curl http://localhost:3002/health
```

---

## Version History

- **1.0.0** (December 2024): Initial production release

---

**Last Updated**: December 2024  
**Maintained By**: Development Team  
**License**: MIT
