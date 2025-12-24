import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock,
  Wrench,
  DollarSign,
  TrendingDown,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { PNode } from '@/types/pnode';
import { predictiveMaintenanceService, FailurePrediction } from '@/services/predictive-maintenance';

interface PredictiveMaintenanceDashboardProps {
  nodes: PNode[];
}

export function PredictiveMaintenanceDashboard({ nodes }: PredictiveMaintenanceDashboardProps) {
  const [predictions, setPredictions] = useState<FailurePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (nodes.length === 0) return;

    const analyzePredictions = async () => {
      setIsLoading(true);
      const atRiskNodes = nodes.filter(n => 
        n.status !== 'online' || 
        n.health.total < 70 || 
        n.metrics.uptime < 99 ||
        n.storage.usagePercent > 85
      );

      const predictionPromises = atRiskNodes.slice(0, 20).map(node => 
        predictiveMaintenanceService.predictFailure(node)
      );

      const results = await Promise.all(predictionPromises);
      setPredictions(results.sort((a, b) => b.failureProbability - a.failureProbability));
      setIsLoading(false);
    };

    analyzePredictions();
  }, [nodes]);

  const getRiskColor = (risk: FailurePrediction['riskLevel']) => {
    switch (risk) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getRiskIcon = (risk: FailurePrediction['riskLevel']) => {
    switch (risk) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const criticalCount = predictions.filter(p => p.riskLevel === 'critical').length;
  const highCount = predictions.filter(p => p.riskLevel === 'high').length;
  const totalCost = predictions.reduce((sum, p) => sum + p.costImpact, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wrench className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Analyzing failure patterns...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Critical Risk</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-500">{criticalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              <span className="text-xs md:text-sm text-muted-foreground">High Risk</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-orange-500">{highCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
              <span className="text-xs md:text-sm text-muted-foreground">At Risk</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{predictions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Cost Impact</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">${totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
            <Wrench className="h-4 w-4 md:h-5 md:w-5" />
            Failure Predictions & Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-green-600">All nodes healthy</p>
              <p className="text-xs text-muted-foreground mt-1">No maintenance required at this time</p>
            </div>
          ) : (
            <ScrollArea className="h-96 md:h-[600px]">
              <div className="space-y-3">
                {predictions.map((prediction) => {
                  const schedule = predictiveMaintenanceService.generateMaintenanceSchedule(prediction);
                  
                  return (
                    <div 
                      key={prediction.nodeId} 
                      className={`p-3 md:p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-all ${
                        prediction.riskLevel === 'critical' ? 'border-2 border-red-500/50 bg-red-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="mt-0.5">{getRiskIcon(prediction.riskLevel)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-mono text-xs md:text-sm font-medium truncate">
                                {prediction.nodeId.substring(0, 12)}...
                              </span>
                              <Badge className={`${getRiskColor(prediction.riskLevel)} text-white text-xs`}>
                                {prediction.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl md:text-3xl font-bold">{prediction.failureProbability}%</div>
                          <div className="text-xs text-muted-foreground">failure risk</div>
                        </div>
                      </div>

                      {/* Failure Probability Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Failure Probability</span>
                          <span className="font-medium">{prediction.confidence}% confidence</span>
                        </div>
                        <Progress value={prediction.failureProbability} className="h-2" />
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{prediction.timeToFailure}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Downtime:</span>
                          <span className="font-medium">{prediction.estimatedDowntime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Impact:</span>
                          <span className="font-medium">${prediction.costImpact}</span>
                        </div>
                      </div>

                      {/* Failure Indicators */}
                      {prediction.indicators.length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="text-xs font-medium mb-2">⚠️ Failure Indicators:</div>
                          <div className="space-y-1">
                            {prediction.indicators.slice(0, 3).map((indicator, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <Badge variant="outline" className={`text-xs ${
                                  indicator.severity === 'high' ? 'border-red-500 text-red-500' :
                                  indicator.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                                  'border-blue-500 text-blue-500'
                                }`}>
                                  {indicator.severity}
                                </Badge>
                                <span className="text-muted-foreground break-words flex-1">
                                  {indicator.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Maintenance Schedule */}
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium">Maintenance Schedule</span>
                          </div>
                          <Badge variant="outline" className={`text-xs ${
                            schedule.priority === 'urgent' ? 'border-red-500 text-red-500' :
                            schedule.priority === 'high' ? 'border-orange-500 text-orange-500' :
                            'border-blue-500 text-blue-500'
                          }`}>
                            {schedule.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Window:</strong> {schedule.suggestedWindow} • <strong>Duration:</strong> {schedule.estimatedDuration}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium mb-2">💡 Recommendations:</div>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {prediction.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span className="break-words flex-1">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {prediction.riskLevel === 'critical' && (
                        <Button size="sm" variant="destructive" className="w-full text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Schedule Urgent Maintenance
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
