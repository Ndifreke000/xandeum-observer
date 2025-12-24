import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PNode } from '@/types/pnode';
import { 
  Activity, 
  Zap, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface NetworkHealthDashboardProps {
  nodes: PNode[];
}

export function NetworkHealthDashboard({ nodes }: NetworkHealthDashboardProps) {
  const networkMetrics = useMemo(() => {
    const totalNodes = nodes.length;
    
    // Handle empty nodes array
    if (totalNodes === 0) {
      return {
        totalNodes: 0,
        onlineNodes: 0,
        unstableNodes: 0,
        offlineNodes: 0,
        avgLatency: 0,
        avgUptime: 0,
        avgHealth: 0,
        totalStorage: 0,
        usedStorage: 0,
        storageUtilization: 0,
        healthScore: 0,
        networkStatus: 'healthy' as const
      };
    }

    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const unstableNodes = nodes.filter(n => n.status === 'unstable').length;
    const offlineNodes = nodes.filter(n => n.status === 'offline').length;

    const avgLatency = nodes.reduce((sum, n) => sum + n.metrics.latency, 0) / totalNodes;
    const avgUptime = nodes.reduce((sum, n) => sum + n.metrics.uptime, 0) / totalNodes;
    const avgHealth = nodes.reduce((sum, n) => sum + n.health.total, 0) / totalNodes;

    const totalStorage = nodes.reduce((sum, n) => sum + n.storage.committed, 0);
    const usedStorage = nodes.reduce((sum, n) => sum + n.storage.used, 0);
    const storageUtilization = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;

    // Network health score (0-100)
    const healthScore = Math.round(
      (onlineNodes / totalNodes) * 40 + // 40% weight on online nodes
      (avgUptime / 100) * 30 + // 30% weight on uptime
      (avgHealth / 100) * 20 + // 20% weight on health
      (avgLatency < 200 ? 10 : avgLatency < 500 ? 5 : 0) // 10% weight on latency
    );

    // Network status
    let networkStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (healthScore < 50 || offlineNodes > totalNodes * 0.3) {
      networkStatus = 'critical';
    } else if (healthScore < 75 || unstableNodes > totalNodes * 0.2) {
      networkStatus = 'degraded';
    }

    return {
      totalNodes,
      onlineNodes,
      unstableNodes,
      offlineNodes,
      avgLatency,
      avgUptime,
      avgHealth,
      totalStorage,
      usedStorage,
      storageUtilization,
      healthScore,
      networkStatus
    };
  }, [nodes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    if (isGood) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (Math.abs(value - threshold) < threshold * 0.1) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Network Status */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(networkMetrics.networkStatus)} flex items-center gap-1`}>
                {getStatusIcon(networkMetrics.networkStatus)}
                {networkMetrics.networkStatus.toUpperCase()}
              </Badge>
              <span className="text-2xl font-bold">{networkMetrics.healthScore}</span>
            </div>
            <Progress value={networkMetrics.healthScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Network Health Score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Node Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Node Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs">Online</span>
              </div>
              <span className="text-sm font-bold">{networkMetrics.onlineNodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs">Unstable</span>
              </div>
              <span className="text-sm font-bold">{networkMetrics.unstableNodes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs">Offline</span>
              </div>
              <span className="text-sm font-bold">{networkMetrics.offlineNodes}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Avg Latency</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(networkMetrics.avgLatency, 200, true)}
                <span className="text-sm font-bold">{networkMetrics.avgLatency.toFixed(0)}ms</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Avg Uptime</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(networkMetrics.avgUptime, 95)}
                <span className="text-sm font-bold">{networkMetrics.avgUptime.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Avg Health</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(networkMetrics.avgHealth, 80)}
                <span className="text-sm font-bold">{networkMetrics.avgHealth.toFixed(0)}/100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Server className="h-4 w-4" />
            Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Utilization</span>
                <span className="font-bold">{networkMetrics.storageUtilization.toFixed(1)}%</span>
              </div>
              <Progress value={networkMetrics.storageUtilization} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Total Capacity</span>
              <span className="font-bold">
                {networkMetrics.totalStorage > 0 ? (networkMetrics.totalStorage / 1024 / 1024 / 1024 / 1024).toFixed(2) : '0.00'} TB
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Used</span>
              <span className="font-bold">
                {networkMetrics.usedStorage > 0 ? (networkMetrics.usedStorage / 1024 / 1024 / 1024 / 1024).toFixed(2) : '0.00'} TB
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
