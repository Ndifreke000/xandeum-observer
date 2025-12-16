import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Server, Wifi, Activity, WifiOff, Heart, Database } from 'lucide-react';

interface NetworkStatsProps {
  nodes: PNode[];
}

export const NetworkStats = ({ nodes }: NetworkStatsProps) => {
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const unstableNodes = nodes.filter(n => n.status === 'unstable').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;
  const avgHealth = nodes.length > 0
    ? Math.round(nodes.reduce((acc, n) => acc + n.health.total, 0) / nodes.length)
    : 0;
  const seedNodes = nodes.filter(n => n.isSeed).length;

  const stats = [
    {
      label: 'Total pNodes',
      value: totalNodes,
      icon: Server,
      color: 'text-foreground',
      subtext: 'Active Network',
      bg: 'bg-primary/10',
    },
    {
      label: 'Online',
      value: onlineNodes,
      icon: Wifi,
      color: 'text-green-500',
      subtext: 'Fully Operational',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Unstable',
      value: unstableNodes,
      icon: Activity,
      color: 'text-yellow-500',
      subtext: 'Degraded Service',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Offline',
      value: offlineNodes,
      icon: WifiOff,
      color: 'text-red-500',
      subtext: 'No Signal',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Avg Health',
      value: `${avgHealth}%`,
      icon: Heart,
      color: 'text-purple-500',
      subtext: 'Network Score',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass-card border-0 overflow-hidden relative group">
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${stat.color.split('-')[1]}-500/5`} />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
