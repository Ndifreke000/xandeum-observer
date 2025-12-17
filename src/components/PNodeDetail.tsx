import { PNode } from '@/types/pnode';
import { RawRPCViewer } from './RawRPCViewer';
import { CopyButton } from './CopyButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Trophy, Coins, Database, Eye, EyeOff, Activity, Clock, Server } from 'lucide-react';

interface PNodeDetailProps {
  node: PNode;
  onClose: () => void;
}

export function PNodeDetail({ node, onClose }: PNodeDetailProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Node Inspector</h2>
          <span className="text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded">
            {node.version?.split('-')[0] || 'Unknown'}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Top Row: Health & Visibility */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center bg-card/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Health Score</span>
            <div className="text-4xl font-bold">{node.health.total}</div>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center bg-card/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Visibility</span>
            <div className="flex items-center gap-2">
              {node.isPublic ? (
                <>
                  <Eye className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-bold text-green-500">PUBLIC</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-bold text-orange-500">PRIVATE</span>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-3 bg-card/50 flex flex-col items-center">
            <Activity className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-xs text-muted-foreground">Latency</span>
            <span className="font-mono font-bold">{node.metrics.latency} ms</span>
          </Card>
          <Card className="p-3 bg-card/50 flex flex-col items-center">
            <Clock className="w-4 h-4 text-green-500 mb-1" />
            <span className="text-xs text-muted-foreground">Uptime</span>
            <span className="font-mono font-bold">{node.metrics.uptime.toFixed(1)}%</span>
          </Card>
          <Card className="p-3 bg-card/50 flex flex-col items-center">
            <Server className="w-4 h-4 text-purple-500 mb-1" />
            <span className="text-xs text-muted-foreground">Status</span>
            <span className={`font-mono font-bold ${node.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
              {node.status.toUpperCase()}
            </span>
          </Card>
        </div>

        {/* Network Rewards */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4" />
            <span className="uppercase tracking-wider">Network Rewards</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card/50">
              <span className="text-xs text-muted-foreground block mb-1">Global Rank</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                #{node.rank || '-'}
              </div>
            </Card>
            <Card className="p-4 bg-card/50">
              <span className="text-xs text-muted-foreground block mb-1">Credits</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                {node.credits?.toLocaleString() || 0}
              </div>
            </Card>
          </div>
        </div>

        {/* Storage Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Database className="w-4 h-4" />
            <span className="uppercase tracking-wider">Storage Metrics</span>
          </div>
          <Card className="p-4 bg-card/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Used Storage</span>
              <span className="font-mono font-medium">{formatBytes(node.storage.used)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Committed Storage</span>
              <span className="font-mono font-medium">{formatBytes(node.storage.committed)}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Utilization</span>
                <span>{(node.storage.usagePercent * 100).toFixed(6)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, node.storage.usagePercent * 100)}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Identity Section */}
        <section className="space-y-3 pt-4 border-t border-border">
          <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-muted-foreground">Last Seen</span>
            <span className="font-mono text-right">
              {node.metrics.lastSeen ? new Date(node.metrics.lastSeen).toLocaleString() : 'N/A'}
            </span>

            <span className="text-muted-foreground">RPC Endpoint</span>
            <div className="flex items-center justify-end gap-2 group">
              <span className="font-mono truncate max-w-[150px]">http://{node.ip}:6000</span>
              <CopyButton text={`http://${node.ip}:6000`} />
            </div>

            <span className="text-muted-foreground">Public Key</span>
            <div className="flex items-center justify-end gap-2 group">
              <span className="font-mono truncate max-w-[150px]">{node.id}</span>
              <CopyButton text={node.id} />
            </div>
          </div>
        </section>

        {/* Monitoring Signals */}
        <section className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Monitoring Signals
          </h3>
          <SignalsList signals={node.signals} />
        </section>

        {/* Availability Analysis */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Availability (7 Days)
          </h3>
          <div className="metric-card">
            <AvailabilityTimeline data={availabilityData} />
          </div>
        </section>

        {/* Performance Analysis */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Latency (24 Hours)
          </h3>
          <div className="metric-card">
            <LatencyChart data={latencyData} />
          </div>
        </section>
      </div>
    </div>
  );
}
