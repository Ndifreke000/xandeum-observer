import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Server, Activity, Database, GitBranch, HardDrive, Globe } from 'lucide-react';

interface NetworkStatsProps {
  nodes: PNode[];
}

export const NetworkStats = ({ nodes }: NetworkStatsProps) => {
  const activeNodes = nodes.filter(n => n.status === 'online').length;

  // Calculate Network Stability (Avg Health)
  const networkStability = nodes.length > 0
    ? Math.round(nodes.reduce((acc, n) => acc + n.health.total, 0) / nodes.length)
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
    },
    {
      label: 'Network Stability',
      value: `${networkStability}%`,
      icon: Activity,
      color: 'text-green-500',
      subtext: 'Avg Health Score',
      bg: 'bg-green-500/10',
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
    },
    {
      label: 'Storage Used',
      value: formatBytes(totalStorageBytes),
      icon: HardDrive,
      color: 'text-blue-500',
      subtext: 'Network Usage',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Consensus Ver',
      value: consensusVersion.split('-')[0], // Show only base version
      icon: GitBranch,
      color: 'text-purple-500',
      subtext: 'Majority Version',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border/50 shadow-premium overflow-hidden relative group bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${stat.color.split('-')[1]}-500/5`} />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
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
      <Card className="lg:col-span-5 border border-border/50 shadow-premium bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regional Distribution</div>
              <div className="flex gap-4 mt-1">
                {topRegions.map(([region, count]) => (
                  <div key={region} className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{region}:</span>
                    <span className="text-xs font-mono font-bold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground italic">
            Requirement 8: Ecosystem Health & Network Growth Visibility
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
