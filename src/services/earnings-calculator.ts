import { PNode } from '@/types/pnode';

export interface EarningsCalculation {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  breakEvenDays: number;
  roi: number;
}

export interface OperatorCosts {
  hardwareCost: number;
  monthlyElectricity: number;
  monthlyBandwidth: number;
  monthlyMaintenance: number;
}

export interface NodeConfiguration {
  storageGB: number;
  uptime: number; // percentage
  latency: number; // ms
}

/**
 * Calculate STOINC earnings based on network data and node configuration
 */
export function calculateEarnings(
  config: NodeConfiguration,
  costs: OperatorCosts,
  networkNodes: PNode[]
): EarningsCalculation {
  // Calculate network averages for baseline
  const networkAvg = calculateNetworkAverages(networkNodes);
  
  // Base earnings per GB per day (derived from network data)
  const baseEarningsPerGB = networkAvg.avgCreditsPerGB;
  
  // Performance multipliers
  const uptimeMultiplier = config.uptime / 100;
  const latencyMultiplier = calculateLatencyMultiplier(config.latency);
  const storageMultiplier = calculateStorageMultiplier(config.storageGB);
  
  // Calculate daily earnings
  const dailyEarnings = 
    config.storageGB * 
    baseEarningsPerGB * 
    uptimeMultiplier * 
    latencyMultiplier * 
    storageMultiplier;
  
  // Calculate time-based earnings
  const weeklyEarnings = dailyEarnings * 7;
  const monthlyEarnings = dailyEarnings * 30;
  const yearlyEarnings = dailyEarnings * 365;
  
  // Calculate costs
  const totalMonthlyCost = 
    costs.monthlyElectricity + 
    costs.monthlyBandwidth + 
    costs.monthlyMaintenance;
  const dailyCost = totalMonthlyCost / 30;
  
  // Calculate net profit
  const dailyProfit = dailyEarnings - dailyCost;
  const monthlyProfit = monthlyEarnings - totalMonthlyCost;
  const yearlyProfit = yearlyEarnings - (totalMonthlyCost * 12);
  
  // Calculate break-even
  const breakEvenDays = dailyProfit > 0 
    ? Math.ceil(costs.hardwareCost / dailyProfit)
    : -1;
  
  // Calculate ROI (yearly profit / total investment)
  const totalInvestment = costs.hardwareCost + (totalMonthlyCost * 12);
  const roi = totalInvestment > 0 
    ? (yearlyProfit / totalInvestment) * 100
    : 0;
  
  return {
    daily: Math.max(0, dailyEarnings),
    weekly: Math.max(0, weeklyEarnings),
    monthly: Math.max(0, monthlyEarnings),
    yearly: Math.max(0, yearlyEarnings),
    breakEvenDays,
    roi
  };
}

/**
 * Calculate network-wide averages from real node data
 */
function calculateNetworkAverages(nodes: PNode[]) {
  if (nodes.length === 0) {
    return {
      avgCreditsPerGB: 0.5, // Fallback default
      avgUptime: 95,
      avgLatency: 100
    };
  }
  
  const onlineNodes = nodes.filter(n => n.status === 'online');
  
  // Calculate average credits per GB
  let totalCreditsPerGB = 0;
  let validNodes = 0;
  
  onlineNodes.forEach(node => {
    const storageGB = (node.storage?.committed || 0) / (1024 * 1024 * 1024);
    const credits = node.credits || 0;
    
    if (storageGB > 0 && credits > 0) {
      totalCreditsPerGB += credits / storageGB;
      validNodes++;
    }
  });
  
  const avgCreditsPerGB = validNodes > 0 
    ? totalCreditsPerGB / validNodes 
    : 0.5; // Fallback
  
  // Calculate average uptime
  const avgUptime = onlineNodes.length > 0
    ? onlineNodes.reduce((sum, n) => sum + (n.metrics?.uptime || 0), 0) / onlineNodes.length
    : 95;
  
  // Calculate average latency
  const avgLatency = onlineNodes.length > 0
    ? onlineNodes.reduce((sum, n) => sum + (n.metrics?.latency || 0), 0) / onlineNodes.length
    : 100;
  
  return {
    avgCreditsPerGB: Math.max(0.1, avgCreditsPerGB), // Minimum 0.1
    avgUptime,
    avgLatency
  };
}

/**
 * Calculate latency performance multiplier
 * Better latency = higher earnings
 */
function calculateLatencyMultiplier(latency: number): number {
  if (latency <= 50) return 1.2;  // Excellent: +20%
  if (latency <= 100) return 1.1; // Good: +10%
  if (latency <= 200) return 1.0; // Average: baseline
  if (latency <= 300) return 0.9; // Below average: -10%
  return 0.8; // Poor: -20%
}

/**
 * Calculate storage capacity multiplier
 * Larger nodes get slight bonus for economies of scale
 */
function calculateStorageMultiplier(storageGB: number): number {
  if (storageGB >= 2000) return 1.15; // 2TB+: +15%
  if (storageGB >= 1000) return 1.1;  // 1TB+: +10%
  if (storageGB >= 500) return 1.05;  // 500GB+: +5%
  return 1.0; // <500GB: baseline
}

/**
 * Get recommended configurations based on budget
 */
export function getRecommendedConfigs(): Array<{
  name: string;
  description: string;
  config: NodeConfiguration;
  costs: OperatorCosts;
}> {
  return [
    {
      name: 'Starter',
      description: 'Entry-level setup for testing',
      config: {
        storageGB: 250,
        uptime: 95,
        latency: 150
      },
      costs: {
        hardwareCost: 500,
        monthlyElectricity: 20,
        monthlyBandwidth: 30,
        monthlyMaintenance: 10
      }
    },
    {
      name: 'Professional',
      description: 'Balanced performance and cost',
      config: {
        storageGB: 1000,
        uptime: 99,
        latency: 80
      },
      costs: {
        hardwareCost: 1500,
        monthlyElectricity: 50,
        monthlyBandwidth: 50,
        monthlyMaintenance: 20
      }
    },
    {
      name: 'Enterprise',
      description: 'Maximum performance and capacity',
      config: {
        storageGB: 2000,
        uptime: 99.9,
        latency: 50
      },
      costs: {
        hardwareCost: 3000,
        monthlyElectricity: 100,
        monthlyBandwidth: 100,
        monthlyMaintenance: 50
      }
    }
  ];
}

/**
 * Compare your configuration against network averages
 */
export function compareToNetwork(
  config: NodeConfiguration,
  networkNodes: PNode[]
): {
  storagePercentile: number;
  uptimePercentile: number;
  latencyPercentile: number;
  overallRank: string;
} {
  if (networkNodes.length === 0) {
    return {
      storagePercentile: 50,
      uptimePercentile: 50,
      latencyPercentile: 50,
      overallRank: 'Average'
    };
  }
  
  const onlineNodes = networkNodes.filter(n => n.status === 'online');
  
  // Storage percentile
  const storageValues = onlineNodes
    .map(n => (n.storage?.committed || 0) / (1024 * 1024 * 1024))
    .sort((a, b) => a - b);
  const storagePercentile = calculatePercentile(config.storageGB, storageValues);
  
  // Uptime percentile
  const uptimeValues = onlineNodes
    .map(n => n.metrics?.uptime || 0)
    .sort((a, b) => a - b);
  const uptimePercentile = calculatePercentile(config.uptime, uptimeValues);
  
  // Latency percentile (lower is better, so invert)
  const latencyValues = onlineNodes
    .map(n => n.metrics?.latency || 0)
    .sort((a, b) => a - b);
  const latencyPercentile = 100 - calculatePercentile(config.latency, latencyValues);
  
  // Overall rank
  const avgPercentile = (storagePercentile + uptimePercentile + latencyPercentile) / 3;
  let overallRank = 'Average';
  if (avgPercentile >= 90) overallRank = 'Elite';
  else if (avgPercentile >= 75) overallRank = 'Excellent';
  else if (avgPercentile >= 60) overallRank = 'Good';
  else if (avgPercentile >= 40) overallRank = 'Average';
  else overallRank = 'Below Average';
  
  return {
    storagePercentile: Math.round(storagePercentile),
    uptimePercentile: Math.round(uptimePercentile),
    latencyPercentile: Math.round(latencyPercentile),
    overallRank
  };
}

function calculatePercentile(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) return 50;
  
  let count = 0;
  for (const v of sortedValues) {
    if (v < value) count++;
    else break;
  }
  
  return (count / sortedValues.length) * 100;
}
