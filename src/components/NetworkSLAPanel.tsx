import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Clock,
  Zap,
  Database
} from 'lucide-react';
import { PNode } from '@/types/pnode';
import { slaVerificationService, SLAMetrics } from '@/services/sla-verification';

interface NetworkSLAPanelProps {
  nodes: PNode[];
}

export function NetworkSLAPanel({ nodes }: NetworkSLAPanelProps) {
  const [slaMetrics, setSlaMetrics] = useState<Map<string, SLAMetrics>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [networkCompliance, setNetworkCompliance] = useState({
    excellent: 0,
    good: 0,
    warning: 0,
    violation: 0
  });

  useEffect(() => {
    if (nodes.length === 0) return;

    const analyzeSLA = async () => {
      setIsLoading(true);
      const metricsMap = new Map<string, SLAMetrics>();
      const compliance = { excellent: 0, good: 0, warning: 0, violation: 0 };

      // Analyze top 20 nodes for performance
      const topNodes = nodes.slice(0, 20);
      
      for (const node of topNodes) {
        try {
          // Get historical data for the node
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/node/${node.id}/history`);
          let historicalData: Array<{ timestamp: number; status: string; [key: string]: unknown }> = [];
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              historicalData = data;
            }
          }
          
          const metrics = await slaVerificationService.calculateSLAMetrics(node, historicalData);
          metricsMap.set(node.id, metrics);
          compliance[metrics.slaCompliance]++;
        } catch (error) {
          console.error(`Failed to analyze SLA for ${node.id}:`, error);
        }
      }

      setSlaMetrics(metricsMap);
      setNetworkCompliance(compliance);
      setIsLoading(false);
    };

    analyzeSLA();
  }, [nodes]);

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'violation': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceIcon = (compliance: string) => {
    switch (compliance) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'violation': return <XCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const totalAnalyzed = networkCompliance.excellent + networkCompliance.good + 
                        networkCompliance.warning + networkCompliance.violation;
  const overallCompliance = totalAnalyzed > 0 
    ? ((networkCompliance.excellent + networkCompliance.good) / totalAnalyzed) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Analyzing SLA compliance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Excellent</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{networkCompliance.excellent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Good</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{networkCompliance.good}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Warning</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{networkCompliance.warning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Violations</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{networkCompliance.violation}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base font-medium">Overall Network Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl md:text-3xl font-bold">{overallCompliance.toFixed(1)}%</span>
              <Badge className={getComplianceColor(overallCompliance >= 90 ? 'excellent' : overallCompliance >= 75 ? 'good' : 'warning')}>
                {overallCompliance >= 90 ? 'Excellent' : overallCompliance >= 75 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress value={overallCompliance} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on {totalAnalyzed} analyzed nodes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Node Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base font-medium">Node SLA Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 md:h-96">
            <div className="space-y-3">
              {Array.from(slaMetrics.entries()).map(([nodeId, metrics]) => (
                <div key={nodeId} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getComplianceIcon(metrics.slaCompliance)}
                      <span className="font-mono text-xs md:text-sm truncate">{nodeId.substring(0, 12)}...</span>
                    </div>
                    <Badge className={`${getComplianceColor(metrics.slaCompliance)} flex-shrink-0 text-xs`}>
                      {metrics.slaCompliance}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 min-w-0">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">Uptime:</span>
                      <span className="font-medium">{metrics.uptimePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Zap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">Latency:</span>
                      <span className="font-medium">{metrics.averageLatency.toFixed(0)}ms</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Database className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">Storage:</span>
                      <span className="font-medium">{metrics.storageReliability.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Shield className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">Proofs:</span>
                      <span className="font-medium">{metrics.proofSubmissionRate.toFixed(0)}%</span>
                    </div>
                  </div>

                  {metrics.violations.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium mb-1">Recent Violations:</div>
                      <div className="space-y-1">
                        {metrics.violations.slice(0, 2).map((violation, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{violation.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
