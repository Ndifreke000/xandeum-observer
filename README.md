# 🌌 Xandeum Network Observer

**The definitive real-time analytics engine for Xandeum's exabyte-scale storage layer.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge)](https://xandeum-observer.vercel.app)
[![Backend Status](https://img.shields.io/badge/Backend-Live-blue?style=for-the-badge)](https://xandeum-observer-ophq.onrender.com/pods)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

Xandeum Network Observer is a world-class monitoring platform designed to provide deep, actionable insights into the Xandeum pNode network. Built for speed, clarity, and scalability, it empowers developers and node operators to visualize the pulse of the decentralized storage revolution.

---

## ✨ Key Innovations

### 🌍 3D Geospatial Intelligence
Visualize the global footprint of Xandeum. Our interactive 3D globe maps pNodes to their physical locations, providing a clear view of network decentralization and density.

### 📡 Live Gossip Feed (Terminal Mode)
Experience the network in real-time. Our custom gossip listener tracks node discoveries, status changes, and storage events in a high-fidelity terminal interface.

### 🔍 Node Inspector & SLA Verification
Deep-dive into any pNode. Our inspector provides:
- **SLA Report Card**: Real-time verification against network reliability guarantees.
- **Reward Forecast**: Estimated STOINC earnings based on uptime, rank, and storage contribution.
- **Achievement System**: Visual badges for "Uptime Kings," "Latency Legends," and "Storage Giants."

### ⌨️ Command Palette (⌘K)
Navigate the network at light speed. Instant search for nodes by IP, ID, or location, making troubleshooting and analysis effortless.

### 🏆 Network Leaderboard
Track the top-performing nodes in the network based on STOINC rewards and storage commitment.

---

## 🛠️ High-Performance Architecture

Our stack is engineered for sub-millisecond responsiveness and 100% data accuracy.

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion.
- **Backend**: Rust (Axum, Tokio) for high-concurrency pRPC data aggregation.
- **Database**: SQLite with SQLx for persistent historical performance tracking.
- **Data Flow**: Direct integration with Xandeum's pRPC protocol via seed nodes.

```mermaid
graph TD
    A[User Browser] -->|HTTP/WS| B[Vite Frontend]
    B -->|REST API| C[Rust Backend]
    C -->|pRPC| D[Xandeum Network]
    C -->|SQL| E[SQLite Persistence]
    C -->|GeoJSON| F[IP Geolocation]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust (latest stable)

### 1. Backend (Rust)
```bash
cd server-rust
cargo run --release
```

### 2. Frontend (React)
```bash
npm install
npm run dev
```

---

## 🏆 Why Xandeum Observer?

Unlike basic dashboards, the Xandeum Observer focuses on **Clarity** and **Innovation**:
- **Zero Mock Data**: Every metric is pulled directly from the pRPC gossip network.
- **Deep Space Aesthetics**: A premium theme designed for professional monitoring environments.
- **Economic Intelligence**: Built-in tools for reward forecasting and capacity planning.

---

Built with ❤️ for the Xandeum Hackathon.
