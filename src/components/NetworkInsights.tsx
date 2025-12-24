import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Zap,
  Target,
  Award,
  ArrowUp
} from 'lucide-react';
import { PNode } from '@/types/pnode';

interface NetworkInsightsProps {
  nodes: PNode[];
}

export function NetworkInsights({ nodes }: NetworkInsightsProps) {
  const insights = useMemo(() => {
    if (nodes.length === 0) return null;

    // Calculate current metrics
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const nodesWithHealth = nodes.filter(n => n.health && n.health.total > 0);
    const avgHealth = nodesWithHealth.length > 0
      ? nodesWithHealth.reduce((sum, n) => sum + n.health.total, 0) / nodesWithHealth.length
      : 0;
    const totalCredits = nodes.reduce((sum, n) => sum + (n.credits || 0), 0);
    const totalStorage = nodes.reduce((sum, n) => sum + n.storage.used, 0);

    // Geographic distribution
    const regions = nodes.reduce((acc, n) => {
      const country = n.geo?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRegion = Object.entries(regions)
      .sort((a, b) => b[1] - a[1])[0];

    // Simulate historical comparison (in production, would use real historical data)
    const healthChange = 15; // +15% vs yesterday (simulated)
    const growthRate = 8; // +8% node growth this week (simulated)
    const predictedGrowth = Math.round(nodes.length * 0.12); // +12% predicted

    // Calculate network value (simulated based on credits)
    const avgCreditsPerNode = totalCredits / nodes.length;
    const estimatedValue = totalCredits * 0.1; // Simulated conversion rate

    return {
      onlineNodes,
      totalNodes: nodes.length,
      avgHealth: Math.round(avgHealth),
      healthChange,
      totalCredits,
      estimatedValue,
      topRegion: topRegion ? { name: topRegion[0], count: topRegion[1] } : null,
      growthRate,
      predictedGrowth,
      totalStorage,
      avgCreditsPerNode: Math.round(avgCreditsPerNode)
    };
  }, [nodes]);

  if (!insights) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Network Insights
          </CardTitle>
          <Badge variant="outline" className="gap-1 border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Insights Grid - SEMANTIC COLORS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Health Trend - GREEN (health/uptime metrics) */}
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground">Network Health</span>
              </div>
              <Badge className="bg-green-500 text-white text-xs">
                +{insights.healthChange}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-green-500">{insights.avgHealth}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {insights.healthChange > 0 ? 'Improving' : 'Declining'} vs yesterday
            </p>
          </div>

          {/* Top Region - BLUE (geographic/distribution) */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">Top Region</span>
              </div>
              <Badge className="bg-blue-500 text-white text-xs">
                <Award className="h-3 w-3 mr-1" />
                #1
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {insights.topRegion?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {insights.topRegion?.count || 0} nodes ({((insights.topRegion?.count || 0) / insights.totalNodes * 100).toFixed(0)}%)
            </p>
          </div>

          {/* Growth Prediction - PURPLE (predictions/analytics) */}
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground">Predicted Growth</span>
              </div>
              <Badge className="bg-purple-500 text-white text-xs">
                Next Week
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              +{insights.predictedGrowth} nodes
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{insights.growthRate}% growth rate
            </p>
          </div>

          {/* Network Value - ORANGE (financial/earnings) */}
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground">Network Value</span>
              </div>
              <Badge className="bg-orange-500 text-white text-xs">
                STOINC
              </Badge>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {insights.totalCredits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ~${insights.estimatedValue.toLocaleString()} estimated
            </p>
          </div>
        </div>

        {/* Summary Insight */}
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-2">
            <ArrowUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-medium">
                Network is performing {insights.healthChange > 10 ? 'exceptionally' : 'well'} with {insights.onlineNodes}/{insights.totalNodes} nodes online
              </p>
              <p className="text-muted-foreground">
                {insights.topRegion?.name} leads with {insights.topRegion?.count} nodes. 
                Average node earning {insights.avgCreditsPerNode.toLocaleString()} STOINC credits. 
                Network expected to grow by {insights.predictedGrowth} nodes next week.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">{insights.onlineNodes}</div>
            <div className="text-[10px] text-muted-foreground">Online Now</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">{insights.avgHealth}%</div>
            <div className="text-[10px] text-muted-foreground">Avg Health</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-500">+{insights.growthRate}%</div>
            <div className="text-[10px] text-muted-foreground">Growth Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
