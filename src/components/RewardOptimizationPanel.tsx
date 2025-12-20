import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Brain, 
  DollarSign, 
  MapPin, 
  Zap, 
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  rewardOptimizationEngine, 
  OptimizationSuggestion, 
  RewardForecast, 
  CapacityPlan 
} from '@/services/reward-optimization';
import { PNode } from '@/types/pnode';
import { slaVerificationService } from '@/services/sla-verification';

interface RewardOptimizationPanelProps {
  node: PNode;
  networkData: PNode[];
}

export function RewardOptimizationPanel({ node, networkData }: RewardOptimizationPanelProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [rewardForecast, setRewardForecast] = useState<RewardForecast | null>(null);
  const [capacityPlan, setCapacityPlan] = useState<CapacityPlan | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<RewardForecast['timeframe']>('30d');
  const [isLoading, setIsLoading] = useState(false);

  const loadOptimizationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const slaMetrics = await slaVerificationService.calculateSLAMetrics(node, []);
      
      const [optimizationSuggestions, forecast, plan] = await Promise.all([
        rewardOptimizationEngine.generateOptimizationSuggestions(node, slaMetrics, networkData),
        rewardOptimizationEngine.generateRewardForecast(node, selectedTimeframe),
        rewardOptimizationEngine.generateCapacityPlan(node, networkData)
      ]);

      setSuggestions(optimizationSuggestions);
      setRewardForecast(forecast);
      setCapacityPlan(plan);
    } catch (error) {
      console.error('Failed to load optimization data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [node, selectedTimeframe, networkData]);

  useEffect(() => {
    loadOptimizationData();
  }, [loadOptimizationData]);

  const getPriorityColor = (priority: OptimizationSuggestion['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'capacity': return <Zap className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'performance': return <Target className="h-4 w-4" />;
      case 'economic': return <DollarSign className="h-4 w-4" />;
      case 'network': return <BarChart3 className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Reward Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="capacity">Capacity Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Optimization Suggestions</h3>
              <Badge variant="outline">{suggestions.length} recommendations</Badge>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No optimization suggestions available</p>
                    <p className="text-xs">Your node is performing optimally</p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(suggestion.type)}
                            <h4 className="font-medium">{suggestion.title}</h4>
                          </div>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Reward Increase:</span>
                              <span className="text-green-600 font-medium">
                                +{suggestion.expectedImpact.rewardIncrease}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Performance Gain:</span>
                              <span className="text-blue-600 font-medium">
                                +{suggestion.expectedImpact.performanceGain}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Cost Reduction:</span>
                              <span className="text-green-600 font-medium">
                                -{suggestion.expectedImpact.costReduction}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Risk Reduction:</span>
                              <span className="text-purple-600 font-medium">
                                -{suggestion.expectedImpact.riskReduction}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Difficulty:</span>
                            <span className={getDifficultyColor(suggestion.implementation.difficulty)}>
                              {suggestion.implementation.difficulty}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Timeframe:</span>
                            <span>{suggestion.implementation.timeframe}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Est. Cost:</span>
                            <span>{formatCurrency(suggestion.implementation.estimatedCost)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Confidence:</span>
                            <span>{suggestion.confidence}%</span>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium mb-2">
                              Implementation Steps
                            </summary>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                              {suggestion.implementation.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </details>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Reward Forecast</h3>
              <div className="flex gap-1">
                {(['1d', '7d', '30d', '90d'] as const).map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>

            {rewardForecast && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Current Projection</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {rewardForecast.currentProjection.toFixed(2)} STOINC
                      </div>
                      <div className="text-xs text-muted-foreground">
                        For {selectedTimeframe}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Optimized Projection</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {rewardForecast.optimizedProjection.toFixed(2)} STOINC
                      </div>
                      <div className="text-xs text-green-600">
                        +{((rewardForecast.optimizedProjection - rewardForecast.currentProjection) / rewardForecast.currentProjection * 100).toFixed(1)}% potential
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Reward Factors</h4>
                  <div className="space-y-2">
                    {Object.entries(rewardForecast.factors).map(([factor, value]) => (
                      <div key={factor} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{factor.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={value * 100} className="w-20 h-2" />
                          <span className="text-sm font-medium w-12">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Market Conditions</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getChangeIcon(rewardForecast.marketConditions.networkGrowth)}
                        <span className="font-medium">
                          {(rewardForecast.marketConditions.networkGrowth * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-muted-foreground">Network Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getChangeIcon(-rewardForecast.marketConditions.competitionLevel)}
                        <span className="font-medium">
                          {(rewardForecast.marketConditions.competitionLevel * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-muted-foreground">Competition</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getChangeIcon(rewardForecast.marketConditions.demandForecast)}
                        <span className="font-medium">
                          {(rewardForecast.marketConditions.demandForecast * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-muted-foreground">Demand Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Capacity Expansion Plan</h3>
              <Badge variant="outline">AI-Generated</Badge>
            </div>

            {capacityPlan && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Current Capacity</span>
                      <div className="text-xl font-bold">
                        {(capacityPlan.currentCapacity / (1024 ** 3)).toFixed(1)} TB
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Recommended Capacity</span>
                      <div className="text-xl font-bold text-blue-600">
                        {(capacityPlan.recommendedCapacity / (1024 ** 3)).toFixed(1)} TB
                      </div>
                      <div className="text-xs text-blue-600">
                        +{(((capacityPlan.recommendedCapacity - capacityPlan.currentCapacity) / capacityPlan.currentCapacity) * 100).toFixed(0)}% expansion
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Growth Projection</h4>
                  <div className="space-y-2">
                    {Object.entries(capacityPlan.growthProjection).map(([period, capacity]) => (
                      <div key={period} className="flex justify-between items-center">
                        <span className="text-sm">{period}</span>
                        <span className="font-medium">
                          {(capacity / (1024 ** 3)).toFixed(1)} TB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Investment Required</span>
                      </div>
                      <div className="text-xl font-bold">
                        {formatCurrency(capacityPlan.investmentRequired)}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Breakeven</span>
                      </div>
                      <div className="text-xl font-bold">
                        {capacityPlan.roi.breakeven} days
                      </div>
                    </div>
                  </Card>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">
                        Projected Annual ROI: {capacityPlan.roi.yearlyReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm">
                        Based on current network growth trends and your node's performance metrics.
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}