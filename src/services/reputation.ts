import { PNode } from '@/types/pnode';

export interface ReputationScore {
  nodeId: string;
  totalScore: number; // 0-100
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'unranked';
  rank: number;
  components: {
    uptime: number; // 0-30 points
    performance: number; // 0-25 points
    reliability: number; // 0-25 points
    longevity: number; // 0-20 points
  };
  badges: string[];
  trustLevel: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: number;
}

export interface ReputationLeaderboard {
  topNodes: ReputationScore[];
  averageScore: number;
  totalRanked: number;
}

class ReputationService {
  private reputationCache: Map<string, ReputationScore> = new Map();
  private readonly DECAY_RATE = 0.95; // 5% decay per day for inactive nodes

  /**
   * Calculate reputation score for a node
   */
  calculateReputation(node: PNode, allNodes: PNode[]): ReputationScore {
    const components = {
      uptime: this.calculateUptimeScore(node),
      performance: this.calculatePerformanceScore(node, allNodes),
      reliability: this.calculateReliabilityScore(node),
      longevity: this.calculateLongevityScore(node)
    };

    const totalScore = Object.values(components).reduce((sum, score) => sum + score, 0);
    const tier = this.determineTier(totalScore);
    const badges = this.awardBadges(node, components, totalScore);
    const trustLevel = this.determineTrustLevel(totalScore);

    const reputation: ReputationScore = {
      nodeId: node.id,
      totalScore: Math.round(totalScore),
      tier,
      rank: 0, // Will be set when calculating leaderboard
      components,
      badges,
      trustLevel,
      lastUpdated: Date.now()
    };

    this.reputationCache.set(node.id, reputation);
    return reputation;
  }

  /**
   * Calculate uptime score (0-30 points)
   */
  private calculateUptimeScore(node: PNode): number {
    const uptime = node.metrics.uptime;
    
    if (uptime >= 99.9) return 30;
    if (uptime >= 99.5) return 28;
    if (uptime >= 99.0) return 25;
    if (uptime >= 98.0) return 20;
    if (uptime >= 95.0) return 15;
    if (uptime >= 90.0) return 10;
    return Math.max(0, uptime / 10);
  }

  /**
   * Calculate performance score (0-25 points)
   */
  private calculatePerformanceScore(node: PNode, allNodes: PNode[]): number {
    const avgLatency = allNodes.reduce((sum, n) => sum + n.metrics.latency, 0) / allNodes.length;
    const latencyScore = Math.max(0, 25 - (node.metrics.latency / avgLatency) * 10);
    
    return Math.min(25, latencyScore);
  }

  /**
   * Calculate reliability score (0-25 points)
   */
  private calculateReliabilityScore(node: PNode): number {
    const healthScore = (node.health.total / 100) * 15;
    const storageReliability = node.storage.usagePercent < 90 ? 10 : 5;
    
    return healthScore + storageReliability;
  }

  /**
   * Calculate longevity score (0-20 points)
   */
  private calculateLongevityScore(node: PNode): number {
    // Based on how long the node has been discovered
    const discoveredAt = new Date(node.discoveredAt).getTime();
    const ageInDays = (Date.now() - discoveredAt) / (1000 * 60 * 60 * 24);
    
    if (ageInDays >= 90) return 20;
    if (ageInDays >= 60) return 17;
    if (ageInDays >= 30) return 14;
    if (ageInDays >= 14) return 10;
    if (ageInDays >= 7) return 7;
    return Math.min(5, ageInDays);
  }

  /**
   * Determine reputation tier
   */
  private determineTier(score: number): ReputationScore['tier'] {
    if (score >= 90) return 'platinum';
    if (score >= 75) return 'gold';
    if (score >= 60) return 'silver';
    if (score >= 40) return 'bronze';
    return 'unranked';
  }

  /**
   * Determine trust level
   */
  private determineTrustLevel(score: number): ReputationScore['trustLevel'] {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Award badges based on achievements
   */
  private awardBadges(node: PNode, components: ReputationScore['components'], totalScore: number): string[] {
    const badges: string[] = [];

    // Uptime badges
    if (components.uptime >= 29) badges.push('🏆 99.9% Uptime');
    if (components.uptime >= 25) badges.push('⭐ High Availability');

    // Performance badges
    if (components.performance >= 23) badges.push('⚡ Lightning Fast');
    if (node.metrics.latency < 50) badges.push('🚀 Ultra Low Latency');

    // Reliability badges
    if (components.reliability >= 23) badges.push('🛡️ Rock Solid');
    if (node.health.total >= 95) badges.push('💎 Perfect Health');

    // Longevity badges
    if (components.longevity >= 18) badges.push('🎖️ Veteran Node');
    if (components.longevity >= 14) badges.push('📅 Long-term Operator');

    // Overall badges
    if (totalScore >= 95) badges.push('👑 Elite Node');
    if (totalScore >= 90) badges.push('🌟 Top Performer');

    // Special badges
    if (node.isSeed) badges.push('🌱 Seed Node');
    if (node.storage.committed > 1024 * 1024 * 1024 * 1024) badges.push('💾 Storage Giant');

    return badges;
  }

  /**
   * Generate leaderboard
   */
  generateLeaderboard(nodes: PNode[]): ReputationLeaderboard {
    const reputations = nodes.map(node => this.calculateReputation(node, nodes));
    
    // Sort by credits first (primary), then by total score (secondary)
    // This ensures nodes with more STOINC rewards rank higher
    reputations.sort((a, b) => {
      const nodeA = nodes.find(n => n.id === a.nodeId);
      const nodeB = nodes.find(n => n.id === b.nodeId);
      const creditsA = nodeA?.credits || 0;
      const creditsB = nodeB?.credits || 0;
      
      // Primary sort: by credits (descending)
      if (creditsB !== creditsA) {
        return creditsB - creditsA;
      }
      
      // Secondary sort: by reputation score (descending)
      return b.totalScore - a.totalScore;
    });
    
    // Assign ranks
    reputations.forEach((rep, index) => {
      rep.rank = index + 1;
    });

    const averageScore = reputations.reduce((sum, rep) => sum + rep.totalScore, 0) / reputations.length;

    return {
      topNodes: reputations.slice(0, 50), // Top 50
      averageScore: Math.round(averageScore),
      totalRanked: reputations.length
    };
  }

  /**
   * Get reputation for a specific node
   */
  getNodeReputation(nodeId: string): ReputationScore | null {
    return this.reputationCache.get(nodeId) || null;
  }

  /**
   * Apply reputation decay for inactive nodes
   */
  applyDecay(nodeId: string): void {
    const reputation = this.reputationCache.get(nodeId);
    if (reputation) {
      const daysSinceUpdate = (Date.now() - reputation.lastUpdated) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 1) {
        const decayFactor = Math.pow(this.DECAY_RATE, Math.floor(daysSinceUpdate));
        reputation.totalScore = Math.round(reputation.totalScore * decayFactor);
        reputation.tier = this.determineTier(reputation.totalScore);
        reputation.trustLevel = this.determineTrustLevel(reputation.totalScore);
      }
    }
  }

  /**
   * Get tier color for UI
   */
  getTierColor(tier: ReputationScore['tier']): string {
    switch (tier) {
      case 'platinum': return 'from-cyan-400 to-blue-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-600 to-orange-800';
      default: return 'from-gray-400 to-gray-600';
    }
  }

  /**
   * Get tier icon
   */
  getTierIcon(tier: ReputationScore['tier']): string {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '⚪';
    }
  }
}

export const reputationService = new ReputationService();
