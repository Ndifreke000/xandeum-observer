import { PNode } from '@/types/pnode';

export interface HealthScoreBreakdown {
  overall: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  components: {
    uptime: { score: number; weight: number; value: number };
    health: { score: number; weight: number; value: number };
    storage: { score: number; weight: number; value: number };
    latency: { score: number; weight: number; value: number };
    contribution: { score: number; weight: number; value: number };
  };
}

export interface HealthScoreWeights {
  uptime: number;
  health: number;
  storage: number;
  latency: number;
  contribution: number;
}

const DEFAULT_WEIGHTS: HealthScoreWeights = {
  uptime: 0.30,      // 30%
  health: 0.25,      // 25%
  storage: 0.20,     // 20%
  latency: 0.15,     // 15%
  contribution: 0.10 // 10%
};

/**
 * Calculate composite health score for a node
 * Similar to StakeWiz's Wiz Score but tailored for pNodes
 */
export function calculateHealthScore(
  node: PNode,
  weights: HealthScoreWeights = DEFAULT_WEIGHTS
): HealthScoreBreakdown {
  // 1. Uptime Score (0-100)
  const uptimeValue = node.uptime || 0;
  const uptimeScore = Math.min(100, uptimeValue);

  // 2. Health Score (0-100)
  const healthValue = node.health?.total || 0;
  const healthScore = Math.min(100, healthValue);

  // 3. Storage Reliability Score (0-100)
  const storageUsed = node.storage?.used || 0;
  const storageCommitted = node.storage?.committed || 1;
  const storageUtilization = (storageUsed / storageCommitted) * 100;
  // Optimal utilization is 60-80%, penalize too low or too high
  let storageScore = 100;
  if (storageUtilization < 40) {
    storageScore = 50 + (storageUtilization / 40) * 50; // Underutilized
  } else if (storageUtilization > 90) {
    storageScore = 100 - ((storageUtilization - 90) / 10) * 50; // Overutilized
  }

  // 4. Latency Performance Score (0-100)
  const latencyValue = node.latency || 0;
  let latencyScore = 100;
  if (latencyValue > 0) {
    // <50ms = 100, 50-100ms = 90-100, 100-200ms = 70-90, >200ms = <70
    if (latencyValue <= 50) {
      latencyScore = 100;
    } else if (latencyValue <= 100) {
      latencyScore = 90 + ((100 - latencyValue) / 50) * 10;
    } else if (latencyValue <= 200) {
      latencyScore = 70 + ((200 - latencyValue) / 100) * 20;
    } else {
      latencyScore = Math.max(0, 70 - ((latencyValue - 200) / 100) * 10);
    }
  }

  // 5. Network Contribution Score (0-100)
  // Based on credits earned and storage provided
  const credits = node.credits || 0;
  const storageGB = (storageCommitted / (1024 * 1024 * 1024)) || 0;
  // Normalize: 100+ credits = 50 points, 100+ GB = 50 points
  const creditScore = Math.min(50, (credits / 100) * 50);
  const storageContribution = Math.min(50, (storageGB / 100) * 50);
  const contributionScore = creditScore + storageContribution;

  // Calculate weighted overall score
  const overall = Math.round(
    uptimeScore * weights.uptime +
    healthScore * weights.health +
    storageScore * weights.storage +
    latencyScore * weights.latency +
    contributionScore * weights.contribution
  );

  // Determine grade
  const grade = getGrade(overall);

  // Determine trend (simplified - in production would use historical data)
  const trend = determineTrend(node);

  return {
    overall,
    grade,
    trend,
    components: {
      uptime: { score: Math.round(uptimeScore), weight: weights.uptime, value: uptimeValue },
      health: { score: Math.round(healthScore), weight: weights.health, value: healthValue },
      storage: { score: Math.round(storageScore), weight: weights.storage, value: storageUtilization },
      latency: { score: Math.round(latencyScore), weight: weights.latency, value: latencyValue },
      contribution: { score: Math.round(contributionScore), weight: weights.contribution, value: credits }
    }
  };
}

function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

function determineTrend(node: PNode): 'up' | 'down' | 'stable' {
  // Simplified trend detection based on current status
  // In production, would compare with historical data
  if (node.status === 'online' && (node.health?.total || 0) > 80) {
    return 'up';
  }
  if (node.status === 'offline' || (node.health?.total || 0) < 50) {
    return 'down';
  }
  return 'stable';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score >= 80) return 'bg-green-500/10 border-green-500/20';
  if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20';
  if (score >= 60) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

/**
 * Calculate network-wide health score statistics
 */
export function calculateNetworkHealthStats(nodes: PNode[]) {
  if (nodes.length === 0) {
    return {
      average: 0,
      median: 0,
      p95: 0,
      distribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
    };
  }

  const scores = nodes.map(node => calculateHealthScore(node).overall).sort((a, b) => a - b);
  
  const average = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const median = scores[Math.floor(scores.length / 2)];
  const p95Index = Math.floor(scores.length * 0.95);
  const p95 = scores[p95Index];

  const distribution = {
    excellent: scores.filter(s => s >= 90).length,
    good: scores.filter(s => s >= 70 && s < 90).length,
    fair: scores.filter(s => s >= 50 && s < 70).length,
    poor: scores.filter(s => s < 50).length
  };

  return { average, median, p95, distribution };
}
