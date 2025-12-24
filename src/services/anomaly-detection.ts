import { PNode } from '@/types/pnode';

export interface Anomaly {
  id: string;
  nodeId: string;
  type: 'latency_spike' | 'offline_pattern' | 'storage_anomaly' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  timestamp: number;
  description: string;
  metrics: {
    current: number;
    baseline: number;
    deviation: number;
  };
  recommendation: string;
}

export interface AnomalyStats {
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  affectedNodes: number;
  detectionRate: number;
}

class AnomalyDetectionService {
  private anomalyHistory: Map<string, Anomaly[]> = new Map();
  private baselineMetrics: Map<string, { latency: number; uptime: number }> = new Map();

  /**
   * Detect anomalies across all nodes
   */
  detectAnomalies(nodes: PNode[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const now = Date.now();

    // Calculate network baseline
    const networkBaseline = this.calculateNetworkBaseline(nodes);

    nodes.forEach(node => {
      // Latency spike detection
      const latencyAnomaly = this.detectLatencySpike(node, networkBaseline.avgLatency);
      if (latencyAnomaly) anomalies.push(latencyAnomaly);

      // Offline pattern detection
      const offlineAnomaly = this.detectOfflinePattern(node);
      if (offlineAnomaly) anomalies.push(offlineAnomaly);

      // Storage anomaly detection
      const storageAnomaly = this.detectStorageAnomaly(node);
      if (storageAnomaly) anomalies.push(storageAnomaly);

      // Performance degradation
      const perfAnomaly = this.detectPerformanceDegradation(node, networkBaseline);
      if (perfAnomaly) anomalies.push(perfAnomaly);
    });

    // Store in history
    anomalies.forEach(anomaly => {
      const history = this.anomalyHistory.get(anomaly.nodeId) || [];
      history.push(anomaly);
      // Keep only last 100 anomalies per node
      if (history.length > 100) history.shift();
      this.anomalyHistory.set(anomaly.nodeId, history);
    });

    return anomalies;
  }

  /**
   * Calculate network baseline metrics
   */
  private calculateNetworkBaseline(nodes: PNode[]): {
    avgLatency: number;
    avgUptime: number;
    avgHealth: number;
  } {
    const onlineNodes = nodes.filter(n => n.status === 'online');
    if (onlineNodes.length === 0) {
      return { avgLatency: 0, avgUptime: 0, avgHealth: 0 };
    }

    const avgLatency = onlineNodes.reduce((sum, n) => sum + n.metrics.latency, 0) / onlineNodes.length;
    const avgUptime = onlineNodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / onlineNodes.length;
    const avgHealth = onlineNodes.reduce((sum, n) => sum + n.health.total, 0) / onlineNodes.length;

    return { avgLatency, avgUptime, avgHealth };
  }

  /**
   * Detect latency spikes (> 3x standard deviation from baseline)
   */
  private detectLatencySpike(node: PNode, networkAvgLatency: number): Anomaly | null {
    const threshold = networkAvgLatency * 2.5; // 2.5x network average
    const deviation = ((node.metrics.latency - networkAvgLatency) / networkAvgLatency) * 100;

    if (node.metrics.latency > threshold && node.metrics.latency > 100) {
      const severity = this.calculateSeverity(deviation);
      const score = Math.min(100, deviation);

      return {
        id: `${node.id}-latency-${Date.now()}`,
        nodeId: node.id,
        type: 'latency_spike',
        severity,
        score,
        timestamp: Date.now(),
        description: `Latency spike detected: ${node.metrics.latency.toFixed(0)}ms (${deviation.toFixed(0)}% above baseline)`,
        metrics: {
          current: node.metrics.latency,
          baseline: networkAvgLatency,
          deviation
        },
        recommendation: severity === 'critical' 
          ? 'Immediate investigation required. Check network connectivity and node resources.'
          : 'Monitor closely. Consider restarting node if issue persists.'
      };
    }

    return null;
  }

  /**
   * Detect offline patterns (frequent disconnections)
   */
  private detectOfflinePattern(node: PNode): Anomaly | null {
    if (node.status === 'offline' || node.status === 'unstable') {
      const uptimeScore = 100 - node.metrics.uptime;
      const severity = node.status === 'offline' ? 'critical' : 'high';

      return {
        id: `${node.id}-offline-${Date.now()}`,
        nodeId: node.id,
        type: 'offline_pattern',
        severity,
        score: uptimeScore,
        timestamp: Date.now(),
        description: `Node ${node.status}: Uptime at ${node.metrics.uptime.toFixed(1)}%`,
        metrics: {
          current: node.metrics.uptime,
          baseline: 99.9,
          deviation: 99.9 - node.metrics.uptime
        },
        recommendation: node.status === 'offline'
          ? 'Node is offline. Check system status and restart if necessary.'
          : 'Node is unstable. Investigate network issues or resource constraints.'
      };
    }

    return null;
  }

  /**
   * Detect storage anomalies
   */
  private detectStorageAnomaly(node: PNode): Anomaly | null {
    const usagePercent = node.storage.usagePercent;

    if (usagePercent > 90) {
      const severity = usagePercent > 95 ? 'critical' : 'high';
      const score = usagePercent;

      return {
        id: `${node.id}-storage-${Date.now()}`,
        nodeId: node.id,
        type: 'storage_anomaly',
        severity,
        score,
        timestamp: Date.now(),
        description: `Storage usage critical: ${usagePercent.toFixed(1)}% full`,
        metrics: {
          current: usagePercent,
          baseline: 80,
          deviation: usagePercent - 80
        },
        recommendation: usagePercent > 95
          ? 'URGENT: Storage nearly full. Expand capacity immediately or risk data loss.'
          : 'Storage usage high. Plan capacity expansion soon.'
      };
    }

    return null;
  }

  /**
   * Detect overall performance degradation
   */
  private detectPerformanceDegradation(node: PNode, baseline: { avgHealth: number }): Anomaly | null {
    const healthDrop = baseline.avgHealth - node.health.total;

    if (healthDrop > 30 && node.health.total < 60) {
      const severity = this.calculateSeverity(healthDrop);
      
      return {
        id: `${node.id}-perf-${Date.now()}`,
        nodeId: node.id,
        type: 'performance_degradation',
        severity,
        score: healthDrop,
        timestamp: Date.now(),
        description: `Performance degraded: Health score ${node.health.total}/100 (${healthDrop.toFixed(0)} points below network average)`,
        metrics: {
          current: node.health.total,
          baseline: baseline.avgHealth,
          deviation: healthDrop
        },
        recommendation: 'Review node configuration and resource allocation. Consider maintenance window.'
      };
    }

    return null;
  }

  /**
   * Calculate severity based on deviation
   */
  private calculateSeverity(deviation: number): Anomaly['severity'] {
    if (deviation > 80) return 'critical';
    if (deviation > 50) return 'high';
    if (deviation > 25) return 'medium';
    return 'low';
  }

  /**
   * Get anomaly statistics
   */
  getAnomalyStats(anomalies: Anomaly[]): AnomalyStats {
    const affectedNodes = new Set(anomalies.map(a => a.nodeId)).size;

    return {
      totalAnomalies: anomalies.length,
      criticalCount: anomalies.filter(a => a.severity === 'critical').length,
      highCount: anomalies.filter(a => a.severity === 'high').length,
      mediumCount: anomalies.filter(a => a.severity === 'medium').length,
      lowCount: anomalies.filter(a => a.severity === 'low').length,
      affectedNodes,
      detectionRate: anomalies.length > 0 ? (affectedNodes / anomalies.length) * 100 : 0
    };
  }

  /**
   * Get anomaly history for a node
   */
  getNodeAnomalyHistory(nodeId: string): Anomaly[] {
    return this.anomalyHistory.get(nodeId) || [];
  }

  /**
   * Clear old anomalies (older than 24 hours)
   */
  clearOldAnomalies(): void {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    this.anomalyHistory.forEach((anomalies, nodeId) => {
      const filtered = anomalies.filter(a => a.timestamp > dayAgo);
      if (filtered.length > 0) {
        this.anomalyHistory.set(nodeId, filtered);
      } else {
        this.anomalyHistory.delete(nodeId);
      }
    });
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
