import { PNode } from '@/types/pnode';

export interface FailurePrediction {
  nodeId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  failureProbability: number; // 0-100%
  timeToFailure: string; // e.g., "12-24 hours", "2-3 days"
  confidence: number; // 0-100%
  indicators: FailureIndicator[];
  recommendations: string[];
  estimatedDowntime: string;
  costImpact: number; // USD
}

export interface FailureIndicator {
  type: 'latency_trend' | 'uptime_decline' | 'storage_growth' | 'health_degradation' | 'pattern_anomaly';
  severity: 'low' | 'medium' | 'high';
  description: string;
  trend: 'improving' | 'stable' | 'declining';
  value: number;
}

export interface MaintenanceSchedule {
  nodeId: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  suggestedWindow: string;
  estimatedDuration: string;
  tasks: string[];
  preventableIssues: string[];
}

class PredictiveMaintenanceService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  private predictionCache: Map<string, FailurePrediction> = new Map();

  /**
   * Predict potential failures for a node
   */
  async predictFailure(node: PNode): Promise<FailurePrediction> {
    // Get historical data for trend analysis
    const historicalData = await this.fetchHistoricalData(node.id);
    
    // Analyze indicators
    const indicators = this.analyzeFailureIndicators(node, historicalData);
    
    // Calculate failure probability
    const failureProbability = this.calculateFailureProbability(indicators, node);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(failureProbability);
    
    // Estimate time to failure
    const timeToFailure = this.estimateTimeToFailure(indicators, failureProbability);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(historicalData.length, indicators.length);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(indicators, riskLevel);
    
    // Estimate impact
    const estimatedDowntime = this.estimateDowntime(riskLevel);
    const costImpact = this.estimateCostImpact(node, riskLevel);

    const prediction: FailurePrediction = {
      nodeId: node.id,
      riskLevel,
      failureProbability: Math.round(failureProbability),
      timeToFailure,
      confidence: Math.round(confidence),
      indicators,
      recommendations,
      estimatedDowntime,
      costImpact
    };

    this.predictionCache.set(node.id, prediction);
    return prediction;
  }

  /**
   * Fetch historical data for trend analysis
   */
  private async fetchHistoricalData(nodeId: string): Promise<Array<{ timestamp: number; latency_ms: number | null; status: string | null }>> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/node/${nodeId}/history`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
    return [];
  }

  /**
   * Analyze failure indicators
   */
  private analyzeFailureIndicators(node: PNode, historicalData: Array<{ timestamp: number; latency_ms: number | null; status: string | null }>): FailureIndicator[] {
    const indicators: FailureIndicator[] = [];

    // Latency trend analysis
    if (historicalData.length >= 10) {
      const recentLatencies = historicalData.slice(-10).map(d => d.latency_ms || 0);
      const avgRecent = recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length;
      const trend = this.calculateTrend(recentLatencies);
      
      if (avgRecent > 200 || trend === 'declining') {
        indicators.push({
          type: 'latency_trend',
          severity: avgRecent > 500 ? 'high' : avgRecent > 300 ? 'medium' : 'low',
          description: `Latency trending ${trend}: ${avgRecent.toFixed(0)}ms average`,
          trend,
          value: avgRecent
        });
      }
    }

    // Uptime decline
    if (node.metrics.uptime < 99.0) {
      indicators.push({
        type: 'uptime_decline',
        severity: node.metrics.uptime < 95 ? 'high' : 'medium',
        description: `Uptime below target: ${node.metrics.uptime.toFixed(1)}%`,
        trend: 'declining',
        value: node.metrics.uptime
      });
    }

    // Storage growth
    if (node.storage.usagePercent > 85) {
      indicators.push({
        type: 'storage_growth',
        severity: node.storage.usagePercent > 95 ? 'high' : 'medium',
        description: `Storage usage high: ${node.storage.usagePercent.toFixed(1)}%`,
        trend: 'declining',
        value: node.storage.usagePercent
      });
    }

    // Health degradation
    if (node.health.total < 70) {
      indicators.push({
        type: 'health_degradation',
        severity: node.health.total < 50 ? 'high' : 'medium',
        description: `Overall health declining: ${node.health.total}/100`,
        trend: 'declining',
        value: node.health.total
      });
    }

    // Pattern anomaly (offline/unstable status)
    if (node.status !== 'online') {
      indicators.push({
        type: 'pattern_anomaly',
        severity: node.status === 'offline' ? 'high' : 'medium',
        description: `Node status: ${node.status}`,
        trend: 'declining',
        value: node.status === 'offline' ? 0 : 50
      });
    }

    return indicators;
  }

  /**
   * Calculate trend from time series data
   */
  private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
    if (values.length < 3) return 'stable';
    
    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    
    const change = ((recent - older) / older) * 100;
    
    if (change > 10) return 'declining'; // Higher latency is worse
    if (change < -10) return 'improving';
    return 'stable';
  }

  /**
   * Calculate failure probability
   */
  private calculateFailureProbability(indicators: FailureIndicator[], node: PNode): number {
    let probability = 0;

    // Base probability from indicators
    indicators.forEach(indicator => {
      switch (indicator.severity) {
        case 'high': probability += 25; break;
        case 'medium': probability += 15; break;
        case 'low': probability += 5; break;
      }
    });

    // Adjust based on current status
    if (node.status === 'offline') probability += 30;
    if (node.status === 'unstable') probability += 20;

    // Adjust based on health
    if (node.health.total < 50) probability += 15;
    if (node.health.total < 30) probability += 25;

    return Math.min(100, probability);
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(probability: number): FailurePrediction['riskLevel'] {
    if (probability >= 75) return 'critical';
    if (probability >= 50) return 'high';
    if (probability >= 25) return 'medium';
    return 'low';
  }

  /**
   * Estimate time to failure
   */
  private estimateTimeToFailure(indicators: FailureIndicator[], probability: number): string {
    const highSeverityCount = indicators.filter(i => i.severity === 'high').length;
    
    if (probability >= 80) return '6-12 hours';
    if (probability >= 60) return '12-24 hours';
    if (probability >= 40) return '1-3 days';
    if (probability >= 20) return '3-7 days';
    return '7+ days';
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(dataPoints: number, indicatorCount: number): number {
    const dataConfidence = Math.min(100, (dataPoints / 50) * 50); // Max 50 points
    const indicatorConfidence = Math.min(50, indicatorCount * 10); // Max 50 points
    return dataConfidence + indicatorConfidence;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(indicators: FailureIndicator[], riskLevel: FailurePrediction['riskLevel']): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Schedule immediate maintenance window');
      recommendations.push('Notify operations team of high-risk node');
    }

    indicators.forEach(indicator => {
      switch (indicator.type) {
        case 'latency_trend':
          recommendations.push('Investigate network connectivity and bandwidth');
          recommendations.push('Check for resource contention (CPU/Memory)');
          break;
        case 'uptime_decline':
          recommendations.push('Review system logs for crash patterns');
          recommendations.push('Update node software to latest stable version');
          break;
        case 'storage_growth':
          recommendations.push('Expand storage capacity or archive old data');
          recommendations.push('Implement data retention policies');
          break;
        case 'health_degradation':
          recommendations.push('Run comprehensive health diagnostics');
          recommendations.push('Consider node restart during low-traffic period');
          break;
        case 'pattern_anomaly':
          recommendations.push('Investigate root cause of instability');
          recommendations.push('Enable detailed monitoring and alerting');
          break;
      }
    });

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Estimate downtime
   */
  private estimateDowntime(riskLevel: FailurePrediction['riskLevel']): string {
    switch (riskLevel) {
      case 'critical': return '4-8 hours';
      case 'high': return '2-4 hours';
      case 'medium': return '1-2 hours';
      default: return '< 1 hour';
    }
  }

  /**
   * Estimate cost impact
   */
  private estimateCostImpact(node: PNode, riskLevel: FailurePrediction['riskLevel']): number {
    // Base cost on storage committed (rough estimate)
    const storageValue = (node.storage.committed / (1024 ** 4)) * 100; // $100 per TB
    
    const multipliers = {
      critical: 0.5, // 50% of value
      high: 0.3,
      medium: 0.15,
      low: 0.05
    };

    return Math.round(storageValue * multipliers[riskLevel]);
  }

  /**
   * Generate maintenance schedule
   */
  generateMaintenanceSchedule(prediction: FailurePrediction): MaintenanceSchedule {
    const priority = prediction.riskLevel === 'critical' ? 'urgent' :
                    prediction.riskLevel === 'high' ? 'high' :
                    prediction.riskLevel === 'medium' ? 'medium' : 'low';

    const suggestedWindow = priority === 'urgent' ? 'Next 6 hours' :
                           priority === 'high' ? 'Next 24 hours' :
                           priority === 'medium' ? 'Next 3 days' : 'Next week';

    const tasks = [
      'Backup critical data',
      'Update system packages',
      'Clear temporary files and logs',
      'Restart node services',
      'Verify network connectivity',
      'Run health diagnostics'
    ];

    const preventableIssues = prediction.indicators.map(i => i.description);

    return {
      nodeId: prediction.nodeId,
      priority,
      suggestedWindow,
      estimatedDuration: prediction.estimatedDowntime,
      tasks,
      preventableIssues
    };
  }

  /**
   * Get cached prediction
   */
  getCachedPrediction(nodeId: string): FailurePrediction | null {
    return this.predictionCache.get(nodeId) || null;
  }
}

export const predictiveMaintenanceService = new PredictiveMaintenanceService();
