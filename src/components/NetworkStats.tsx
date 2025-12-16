import { PNode } from '@/types/pnode';
import { Server, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface NetworkStatsProps {
  nodes: PNode[];
}

export function NetworkStats({ nodes }: NetworkStatsProps) {
  const online = nodes.filter(n => n.status === 'online').length;
  const unstable = nodes.filter(n => n.status === 'unstable').length;
  const offline = nodes.filter(n => n.status === 'offline').length;
  const avgHealth = Math.round(nodes.reduce((sum, n) => sum + n.health.total, 0) / nodes.length);
  const seedNodes = nodes.filter(n => n.isSeed).length;

  const stats = [
    { label: 'Total pNodes', value: nodes.length, icon: Server, color: 'text-foreground' },
    { label: 'Online', value: online, icon: Wifi, color: 'text-status-online' },
    { label: 'Unstable', value: unstable, icon: AlertTriangle, color: 'text-status-unstable' },
    { label: 'Offline', value: offline, icon: WifiOff, color: 'text-status-offline' },
    { label: 'Avg Health', value: `${avgHealth}%`, icon: null, color: 'text-foreground' },
    { label: 'Seed Nodes', value: seedNodes, icon: null, color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            {stat.icon && <stat.icon className={`h-4 w-4 ${stat.color}`} />}
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {stat.label}
            </span>
          </div>
          <span className={`text-2xl font-semibold font-mono ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
