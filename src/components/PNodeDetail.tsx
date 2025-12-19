import { PNode } from '@/types/pnode';
import { CopyButton } from './CopyButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Trophy, Coins, Database, Eye, EyeOff, Activity, Clock, Server, Info, ShieldCheck, Zap, Star, Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SignalsList } from './SignalsList';
import { AvailabilityTimeline } from './AvailabilityTimeline';
import { LatencyChart } from './LatencyChart';
import { AvailabilityDataPoint, LatencyDataPoint } from '@/types/pnode';
import { RewardForecast } from './RewardForecast';
import { SLAReportCard } from './SLAReportCard';

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

  // History data should come from the parent or a hook, not generated here
  const availabilityData: AvailabilityDataPoint[] = [];
  const latencyData: LatencyDataPoint[] = [];

  // Node Badges Logic
  const badges = [
    {
      id: 'uptime',
      label: 'Uptime King',
      icon: <ShieldCheck className="h-3 w-3" />,
      active: node.metrics.uptime > 99.9,
      description: 'Maintains >99.9% uptime consistency.'
    },
    {
      id: 'latency',
      label: 'Latency Legend',
      icon: <Zap className="h-3 w-3" />,
      active: node.metrics.latency < 100,
      description: 'Ultra-fast response times (<100ms).'
    },
    {
      id: 'storage',
      label: 'Storage Giant',
      icon: <Database className="h-3 w-3" />,
      active: node.storage.committed > 100 * 1024 ** 3,
      description: 'Contributing >100GB of committed storage.'
    },
    {
      id: 'elite',
      label: 'Top 10 Elite',
      icon: <Trophy className="h-3 w-3" />,
      active: (node.rank || 999) <= 10,
      description: 'Ranked among the top 10 nodes in the network.'
    },
  ].filter(b => b.active);

  const getPerformanceVerdict = () => {
    if (node.health.total > 90) return { label: 'EXCEPTIONAL', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (node.health.total > 75) return { label: 'STRONG', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (node.health.total > 50) return { label: 'STABLE', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'DEGRADED', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const verdict = getPerformanceVerdict();

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Node Inspector</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                v{node.version?.split('-')[0] || '0.0.0'}
              </span>
              {node.isSeed && (
                <Badge variant="secondary" className="text-[8px] h-3.5 px-1 bg-blue-500/10 text-blue-400 border-blue-500/20">SEED</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-white/10 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Performance Verdict & Badges */}
        <Card className="p-6 border-none bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="h-24 w-24" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Performance Verdict</span>
                <div className={cn("text-2xl font-black tracking-tighter", verdict.color)}>
                  {verdict.label}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Health Score</span>
                <div className="text-3xl font-black tracking-tighter text-white">
                  {node.health.total}<span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
            </div>

            {badges.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Node Achievements</span>
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    {badges.map(badge => (
                      <Tooltip key={badge.id}>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="gap-1.5 py-1 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-help">
                            {badge.icon}
                            {badge.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Visibility & Status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Visibility</span>
            <div className="flex items-center gap-2">
              {node.isPublic ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-bold">PUBLIC</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <EyeOff className="w-4 h-4" />
                  <span className="text-sm font-bold">PRIVATE</span>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Network Status</span>
            <div className={cn("flex items-center gap-2", node.status === 'online' ? 'text-emerald-400' : 'text-rose-400')}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", node.status === 'online' ? 'bg-emerald-400' : 'bg-rose-400')} />
              <span className="text-sm font-bold uppercase">{node.status}</span>
            </div>
          </Card>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md flex flex-col items-center group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
            <div className="p-2 bg-blue-500/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Latency</span>
            <span className="font-mono font-bold text-lg">{node.metrics.latency}ms</span>
          </Card>
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md flex flex-col items-center group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
            <div className="p-2 bg-emerald-500/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Uptime</span>
            <span className="font-mono font-bold text-lg">{node.metrics.uptime.toFixed(1)}%</span>
          </Card>
          <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-md flex flex-col items-center group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
            <div className="p-2 bg-purple-500/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
              <Server className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
            <span className={cn("font-mono font-bold text-sm uppercase", node.status === 'online' ? 'text-emerald-400' : 'text-rose-400')}>
              {node.status}
            </span>
          </Card>
        </div>

        {/* Network Rewards */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Trophy className="w-3 h-3" />
            Network Rewards
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform">
                <Trophy className="h-16 w-16" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Global Rank</span>
              <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                <span className="text-yellow-500">#</span>{node.rank || '-'}
              </div>
            </Card>
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform">
                <Coins className="h-16 w-16" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">STOINC Credits</span>
              <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                {node.credits?.toLocaleString() || 0}
              </div>
            </Card>
          </div>
        </div>

        {/* Economic Analysis & SLA Verification */}
        <div className="space-y-6">
          <RewardForecast node={node} />
          <SLAReportCard node={node} />
        </div>

        {/* Storage Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Database className="w-3 h-3" />
            Storage Contribution
          </div>
          <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">Used Storage</span>
              <span className="font-mono font-bold text-sm">{formatBytes(node.storage.used)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">Committed Storage</span>
              <span className="font-mono font-bold text-sm">{formatBytes(node.storage.committed)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Utilization</span>
                <span className="text-primary">{(node.storage.usagePercent * 100).toFixed(4)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
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
