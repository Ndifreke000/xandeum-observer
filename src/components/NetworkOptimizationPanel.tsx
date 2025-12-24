import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  DollarSign,
  Zap,
  MapPin,
  Server,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { PNode } from '@/types/pnode';
import { rewardOptimizationEngine, OptimizationSuggestion, RewardForecast } from '@/services/reward-optimization';
import { slaVerificationService } from '@/services/sla-verification';

interface NetworkOptimizationPanelProps {
  nodes: PNode[];
}

export function NetworkOptimizationPanel({ nodes }: NetworkOptimizationPanelProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [forecasts, setForecasts] = useState<Map<string, RewardForecast>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (nodes.length === 0) return;

    const analyzeOptimizations = async () => {
      setIsLoading(true);
      const allSuggestions: OptimizationSuggestion[] = [];
      const forecastMap = new Map<string, RewardForecast>();

      // Analyze top 10 nodes
      const topNodes = nodes.slice(0, 10);
      
      for (const node of topNodes) {
        try {
          // Get historical data for SLA metrics
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/node/${node.id}/history`);
          let historicalData: Array<{ timestamp: number; status: string; [key: string]: unknown }> = [];
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              historicalData = data;
            }
          }
          
          const slaMetrics = await slaVerificationService.calculateSLAMetrics(node, historicalData);
          const nodeSuggestions = await rewardOptimizationEngine.generateOptimizationSuggestions(node, slaMetrics, nodes);
          allSuggestions.push(...nodeSuggestions);

          const forecast = await rewardOptimizationEngine.generateRewardForecast(node, selectedTimeframe);
          forecastMap.set(node.id, forecast);
        } catch (error) {
          console.error(`Failed to analyze ${node.id}:`, error);
        }
      }

      // Sort by priority and expected impact
      allSuggestions.sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];
        if (aPriority !== bPriority) return bPriority - aPriority;
        return b.expectedImpact.rewardIncrease - a.expectedImpact.rewardIncrease;
      });

      setSuggestions(allSuggestions.slice(0, 20)); // Top 20 suggestions
      setForecasts(forecastMap);
      setIsLoading(false);
    };

    analyzeOptimizations();
  }, [nodes, selectedTimeframe]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'capacity': return <Server className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'economic': return <DollarSign className="h-4 w-4" />;
      case 'network': return <TrendingUp className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">AI analyzing optimization opportunities...</p>
        </CardContent>
      </Card>
    );
  }

  const totalPotentialIncrease = suggestions.reduce((sum, s) => sum + s.expectedImpact.rewardIncrease, 0);
  const avgConfidence = suggestions.length > 0 
    ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length 
    : 0;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suggestions" className="text-xs md:text-sm">
            <span className="hidden sm:inline">Optimization Suggestions</span>
            <span className="sm:hidden">Suggestions</span>
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="text-xs md:text-sm">
            <span className="hidden sm:inline">Reward Forecasts</span>
            <span className="sm:hidden">Forecasts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                  <span className="text-xs md:text-sm text-muted-foreground">Total Suggestions</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">{suggestions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  <span className="text-xs md:text-sm text-muted-foreground">Potential Increase</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">+{totalPotentialIncrease.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
                  <span className="text-xs md:text-sm text-muted-foreground">Avg Confidence</span>
                </div>
                <div className="text-xl md:text-2xl font-bold">{avgConfidence.toFixed(0)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base font-medium">AI-Generated Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 md:h-96">
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 md:p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {getTypeIcon(suggestion.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm md:text-base">{suggestion.title}</div>
                            <div className="text-xs md:text-sm text-muted-foreground mt-1 break-words">
                              {suggestion.description}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getPriorityColor(suggestion.priority)} flex-shrink-0 text-xs`}>
                          {suggestion.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Reward:</span>
                          <span className="font-medium text-green-500 ml-1">
                            +{suggestion.expectedImpact.rewardIncrease.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium text-blue-500 ml-1">
                            -{suggestion.expectedImpact.costReduction.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Performance:</span>
                          <span className="font-medium text-purple-500 ml-1">
                            +{suggestion.expectedImpact.performanceGain.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium ml-1">{suggestion.confidence}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t">
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className={`font-medium ${getDifficultyColor(suggestion.implementation.difficulty)}`}>
                            {suggestion.implementation.difficulty}
                          </span>
                          <span className="text-muted-foreground hidden sm:inline">•</span>
                          <span className="text-muted-foreground">{suggestion.implementation.timeframe}</span>
                          <span className="text-muted-foreground hidden sm:inline">•</span>
                          <span className="text-muted-foreground">${suggestion.implementation.estimatedCost}</span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs w-full sm:w-auto">
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs md:text-sm text-muted-foreground">Timeframe:</span>
            {(['1d', '7d', '30d', '90d'] as const).map((tf) => (
              <Button
                key={tf}
                size="sm"
                variant={selectedTimeframe === tf ? 'default' : 'outline'}
                onClick={() => setSelectedTimeframe(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base font-medium">Reward Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 md:h-96">
                <div className="space-y-3">
                  {Array.from(forecasts.entries()).map(([nodeId, forecast]) => {
                    const improvement = forecast.optimizedProjection - forecast.currentProjection;
                    const improvementPercent = forecast.currentProjection > 0 
                      ? (improvement / forecast.currentProjection) * 100 
                      : 0;

                    return (
                      <div key={nodeId} className="p-3 md:p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs md:text-sm truncate">{nodeId.substring(0, 12)}...</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{forecast.timeframe}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Current Projection</div>
                            <div className="text-lg md:text-xl font-bold">${forecast.currentProjection.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Optimized Projection</div>
                            <div className="text-lg md:text-xl font-bold text-green-500">
                              ${forecast.optimizedProjection.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                          <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs md:text-sm font-medium text-green-500 break-words">
                            +${improvement.toFixed(2)} ({improvementPercent.toFixed(1)}% increase)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                          <div>
                            <span className="text-muted-foreground">Uptime:</span>
                            <span className="font-medium ml-1">{(forecast.factors.uptime * 100).toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Latency:</span>
                            <span className="font-medium ml-1">{(forecast.factors.latency * 100).toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Storage:</span>
                            <span className="font-medium ml-1">{(forecast.factors.storage * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
