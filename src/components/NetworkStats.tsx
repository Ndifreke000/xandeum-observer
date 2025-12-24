import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Server, Activity, Database, GitBranch, HardDrive, Globe, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NetworkStatsProps {
  nodes: PNode[];
}

export const NetworkStats = ({ nodes }: NetworkStatsProps) => {
  const activeNodes = nodes.filter(n => n.status === 'online').length;

  // Calculate Network Stability (Avg Health) - handle nodes with 0 health
  const nodesWithHealth = nodes.filter(n => n.health && n.health.total > 0);
  const networkStability = nodesWithHealth.length > 0
    ? Math.round(nodesWithHealth.reduce((acc, n) => acc + n.health.total, 0) / nodesWithHealth.length)
    : 0;

  // Calculate Total Storage (Sum of Used Storage)
  const totalStorageBytes = nodes.reduce((acc, n) => acc + (n.storage?.used || 0), 0);
  const totalCommittedBytes = nodes.reduce((acc, n) => acc + (n.storage?.committed || 0), 0);
  const saturation = totalCommittedBytes > 0 ? (totalStorageBytes / totalCommittedBytes) * 100 : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Find Consensus Version (Most common version)
  const versionCounts = nodes.reduce((acc, n) => {
    const v = n.version || 'Unknown';
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const consensusVersion = Object.entries(versionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

  // Regional Breakdown
  const regions = nodes.reduce((acc, n) => {
    const region = n.geo?.country || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRegions = Object.entries(regions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const stats = [
    {
      label: 'Active Nodes',
      value: activeNodes,
      icon: Server,
      color: 'text-orange-500',
      subtext: `${nodes.length} Total Discovered`,
      bg: 'bg-orange-500/10',
      tooltip: 'Number of pNodes currently online and responding to network requests'
    },
    {
      label: 'Network Stability',
      value: `${networkStability}%`,
      icon: Activity,
      color: 'text-green-500',
      subtext: 'Avg Health Score',
      bg: 'bg-green-500/10',
      tooltip: 'Average health score across all nodes, indicating overall network reliability'
    },
    {
      label: 'Storage Capacity',
      value: formatBytes(totalCommittedBytes),
      icon: Database,
      color: 'text-cyan-500',
      subtext: `${saturation.toFixed(1)}% Used`,
      bg: 'bg-cyan-500/10',
      badge: saturation > 80 ? 'HIGH' : 'OPTIMAL',
      badgeColor: saturation > 80 ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      tooltip: 'Total storage capacity committed by all pNodes in the network'
    },
    {
      label: 'Storage Used',
      value: formatBytes(totalStorageBytes),
      icon: HardDrive,
      color: 'text-blue-500',
      subtext: 'Network Usage',
      bg: 'bg-blue-500/10',
      tooltip: 'Actual storage currently being used across the network'
    },
    {
      label: 'Consensus Ver',
      value: consensusVersion.split('-')[0], // Show only base version
      icon: GitBranch,
      color: 'text-purple-500',
      subtext: 'Majority Version',
      bg: 'bg-purple-500/10',
      tooltip: 'Most common software version running across the network'
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-border/50 shadow-premium overflow-hidden relative group bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${stat.color.split('-')[1]}-500/5`} />
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                  {stat.label === 'Active Nodes' && (
                    <div className="flex items-center gap-1.5 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-500 tracking-tighter">LIVE</span>
                    </div>
                  )}
                  {stat.badge && (
                    <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${stat.badgeColor}`}>
                      {stat.badge}
                    </div>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="sm:col-span-2 lg:col-span-5 border border-border/50 shadow-premium bg-card/50 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start md:items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <Globe className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Regional Distribution
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {topRegions.map(([region, count]) => (
                      <div key={region} className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm font-medium truncate">{region}:</span>
                        <span className="text-xs md:text-sm font-mono font-bold text-primary">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[9px] md:text-[10px] text-muted-foreground italic text-left md:text-right flex-shrink-0">
                Requirement 8: Ecosystem Health & Network Growth Visibility
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
