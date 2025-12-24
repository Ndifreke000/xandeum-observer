# Xandeum Observer

**Enterprise-grade analytics and monitoring platform for Xandeum pNode operators**

Xandeum Observer is a comprehensive real-time monitoring and analytics platform designed for operators of Xandeum storage provider nodes (pNodes). Built with production-quality code and modern web technologies, it provides deep insights into network health, node performance, and operational metrics.

## Overview

Xandeum is building a scalable storage layer for Solana dApps - a second tier of Solana accounts that can grow to exabytes and beyond. This platform helps operators monitor, optimize, and manage their pNodes effectively.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Rust (latest stable)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Ndifreke000/xandeum-observer.git
cd xandeum-observer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Deployment

```bash
# Using Docker Compose (recommended)
docker-compose up --build

# Frontend: http://localhost:8080
# Backend API: http://localhost:3002
```

## Core Features

### Real-Time Monitoring
- Live pNode discovery via pRPC gossip protocol
- Real-time metrics: uptime, latency, storage capacity, health scores
- Network-wide statistics and performance tracking
- Geographic distribution analysis

### Health Scoring System
Composite health scoring algorithm that evaluates nodes across multiple dimensions:
- **Uptime Performance** (30% weight)
- **Health Metrics** (25% weight)
- **Storage Reliability** (20% weight)
- **Latency Performance** (15% weight)
- **Network Contribution** (10% weight)

Scores range from 0-100 with letter grades (A+ to F) and trend indicators.

### Advanced Filtering
Multi-dimensional filtering system with:
- Search by IP, ID, or location
- Filter by status, region, version
- Health score range filtering
- Uptime and latency thresholds
- Storage capacity filters
- Quick filter presets (Top Performers, Reliable Nodes, High Capacity, etc.)

### STOINC Earnings Calculator
ROI calculator for pNode operators featuring:
- Earnings projections (daily, weekly, monthly, yearly)
- Break-even analysis
- ROI calculations
- Cost analysis (hardware, electricity, bandwidth, maintenance)
- Network comparison and percentile rankings
- Three preset configurations (Starter, Professional, Enterprise)

### Node Comparison
Side-by-side comparison of up to 2 nodes with:
- Health score comparison
- Performance metrics
- Storage capacity
- Earnings comparison
- Overall winner determination

### Network Intelligence
AI-powered analytics including:
- Anomaly detection with severity classification
- Reputation scoring and leaderboards
- Predictive maintenance recommendations
- Performance optimization suggestions
- Network health trends and forecasting

### Consensus Simulator
Interactive Byzantine Fault Tolerant consensus visualization:
- Real-time consensus algorithm demonstration
- Leader election (Raft-inspired)
- Quorum-based voting (2/3 majority)
- Automatic failure detection and recovery
- Configurable simulation parameters
- Educational tool for understanding distributed systems

### SLA Verification
On-chain storage proof verification:
- Real-time SLA compliance tracking
- Uptime, latency, and storage reliability monitoring
- Violation detection with severity levels
- Historical trend analysis
- Proof submission rate tracking

### Web3 Alerts
Multi-channel alerting system:
- XMTP wallet-to-wallet messaging
- Telegram bot integration
- Configurable alert rules
- Alert history tracking
- Test alert functionality

### Data Visualization
- Interactive 3D globe showing node locations
- Network topology maps
- Historical performance charts
- 24-hour trend analysis
- Regional distribution analytics

### User Experience
- Dark/light mode support
- Keyboard shortcuts (⌘K for command palette)
- Bookmarks system
- Export functionality (CSV, JSON, PDF)
- Mobile-responsive design
- Real-time data updates

## Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: TailwindCSS
- **3D Graphics**: Three.js + react-globe.gl
- **Charts**: Recharts
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6

### Backend Stack
- **Language**: Rust
- **Framework**: Axum (async web framework)
- **Runtime**: Tokio
- **Database**: SQLite with SQLx
- **API**: RESTful JSON API
- **Integration**: Direct pRPC protocol integration

### Project Structure

```
xandeum-observer/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── *Dashboard.tsx  # Feature dashboards
│   │   ├── *Panel.tsx      # Feature panels
│   │   └── *.tsx           # Other components
│   ├── pages/              # Route pages
│   │   ├── Index.tsx       # Main dashboard
│   │   ├── AdvancedFeatures.tsx
│   │   ├── Intelligence.tsx
│   │   └── BlockNodeEDA.tsx
│   ├── services/           # Business logic
│   │   ├── prpc.ts         # pRPC integration
│   │   ├── health-score.ts # Health scoring
│   │   ├── earnings-calculator.ts
│   │   └── *.ts            # Other services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── server-rust/            # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   └── *.rs
│   └── Cargo.toml
├── public/                 # Static assets
└── dist/                   # Production build
```

## API Integration

### pRPC Endpoints

The platform integrates with Xandeum's pRPC protocol:

```typescript
// Get all pNodes
GET /pods

// Get specific pNode
GET /pod/{id}

// Response format
{
  id: string,
  address: string,
  status: 'online' | 'unstable' | 'offline',
  health: { total: number },
  storage: { used: number, committed: number },
  metrics: { uptime: number, latency: number },
  geo: { country: string, city: string },
  version: string,
  credits: number
}
```

### Backend API

Rust backend provides additional endpoints:

```
GET  /pods              # List all pNodes
GET  /pod/:id           # Get pNode details
GET  /network/stats     # Network statistics
GET  /health            # Health check
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Frontend
VITE_API_URL=http://localhost:3002

# Backend (server-rust/.env)
DATABASE_URL=sqlite:xandeum.db
PORT=3002

# Optional: Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Telegram Bot Setup

1. Message @BotFather on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token
4. Message @userinfobot to get your chat ID
5. Add both to `.env` file

## Usage Guide

### Main Dashboard

The main dashboard provides an overview of the entire network:

1. **Network Statistics**: Key metrics at a glance
2. **Network Insights**: Predictive analytics and trends
3. **24h Trends**: Historical performance charts
4. **Earnings Calculator**: ROI projections
5. **Leaderboard**: Top performing nodes
6. **3D Globe**: Geographic visualization
7. **Node Registry**: Filterable list of all pNodes

### Advanced Filtering

Access advanced filters via the "Advanced Filters" button:

1. Select quick presets or customize filters
2. Adjust health score, uptime, latency ranges
3. Filter by region, status, or version
4. Sort by any metric
5. Results update in real-time

### Node Comparison

Compare nodes to make informed decisions:

1. Click on a node to view details
2. Click "Compare" on another node
3. View side-by-side metrics
4. See overall winner determination

### Earnings Calculator

Calculate potential earnings:

1. Navigate to the calculator section
2. Choose a preset or customize configuration
3. Input your costs
4. View earnings projections and ROI
5. Compare against network averages

### Intelligence Features

Access AI-powered features via the Intelligence page:

1. **Anomaly Detection**: Identify unusual behavior
2. **Reputation System**: Node reliability rankings
3. **Predictive Maintenance**: Proactive recommendations

### Advanced Features

Explore advanced capabilities:

1. **Consensus Simulator**: Learn about distributed consensus
2. **SLA Verification**: Verify storage proofs
3. **Web3 Alerts**: Configure notifications
4. **AI Optimization**: Get performance recommendations

## Performance

- **Initial Load**: <2 seconds
- **API Response**: <100ms average
- **Real-time Updates**: 30-second polling interval
- **Build Size**: ~3MB (gzipped)
- **Mobile Optimized**: Fully responsive

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Quality

- **TypeScript**: 100% type-safe
- **ESLint**: Configured with recommended rules
- **Zero Errors**: Production build has zero TypeScript errors
- **Testing**: Component and integration tests

## Deployment

### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Render (Recommended for Backend)

1. Connect your GitHub repository
2. Select `server-rust` directory
3. Build command: `cargo build --release`
4. Start command: `./target/release/server`

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t xandeum-observer .
docker run -p 8080:80 xandeum-observer
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Documentation**: See [FEATURES.md](FEATURES.md) for detailed feature documentation
- **Issues**: [GitHub Issues](https://github.com/Ndifreke000/xandeum-observer/issues)
- **Discord**: [Xandeum Discord](https://discord.gg/uqRSmmM5m)

## Acknowledgments

Built for the Xandeum ecosystem with modern web technologies and production-grade architecture.

---

**Status**: Production Ready  
**Version**: 1.0.0  
**Last Updated**: December 2024
