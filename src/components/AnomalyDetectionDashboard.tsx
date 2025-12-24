import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  TrendingUp,
  Activity,
  Zap,
  Shield
} from 'lucide-react';
import { PNode } from '@/types/pnode';
import { anomalyDetectionService, Anomaly, AnomalyStats } from '@/services/anomaly-detection';

interface AnomalyDetectionDashboardProps {
  nodes: PNode[];
}

export function AnomalyDetectionDashboard({ nodes }: AnomalyDetectionDashboardProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (nodes.length === 0) return;

    const detectAnomalies = () => {
      setIsLoading(true);
      const detected = anomalyDetectionService.detectAnomalies(nodes);
      const anomalyStats = anomalyDetectionService.getAnomalyStats(detected);
      
      setAnomalies(detected.sort((a, b) => b.score - a.score));
      setStats(anomalyStats);
      setIsLoading(false);
    };

    detectAnomalies();
    const interval = setInterval(detectAnomalies, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [nodes]);

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
    }
  };

  const getSeverityIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'latency_spike': return <Zap className="h-4 w-4" />;
      case 'offline_pattern': return <AlertTriangle className="h-4 w-4" />;
      case 'storage_anomaly': return <Shield className="h-4 w-4" />;
      case 'performance_degradation': return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Detecting anomalies...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Total</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{stats?.totalAnomalies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Critical</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-500">{stats?.criticalCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
              <span className="text-xs md:text-sm text-muted-foreground">High</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-orange-500">{stats?.highCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Medium</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-yellow-500">{stats?.mediumCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Affected</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{stats?.affectedNodes || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base font-medium">Detected Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-green-600">No anomalies detected</p>
              <p className="text-xs text-muted-foreground mt-1">All nodes operating normally</p>
            </div>
          ) : (
            <ScrollArea className="h-64 md:h-96">
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.id} className="p-3 md:p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="mt-0.5">{getTypeIcon(anomaly.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs md:text-sm truncate">
                              {anomaly.nodeId.substring(0, 12)}...
                            </span>
                            <Badge className={`${getSeverityColor(anomaly.severity)} flex items-center gap-1 text-xs`}>
                              {getSeverityIcon(anomaly.severity)}
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground break-words">
                            {anomaly.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg md:text-xl font-bold">{anomaly.score}</div>
                        <div className="text-xs text-muted-foreground">score</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Deviation from baseline</span>
                        <span className="font-medium">{anomaly.metrics.deviation.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(100, anomaly.metrics.deviation)} className="h-1.5" />
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium mb-1">💡 Recommendation:</div>
                      <p className="text-xs text-muted-foreground break-words">{anomaly.recommendation}</p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
