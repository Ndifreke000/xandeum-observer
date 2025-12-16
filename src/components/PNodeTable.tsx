import { useState, useMemo } from 'react';
import { PNode, PNodeStatus } from '@/types/pnode';
import { StatusBadge } from './StatusBadge';
import { HealthScore } from './HealthScore';
import { CopyButton } from './CopyButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Search, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PNodeTableProps {
  nodes: PNode[];
  onSelectNode: (node: PNode) => void;
  selectedNodeId?: string;
}

type SortField = 'status' | 'uptime' | 'latency' | 'health' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

export function PNodeTable({ nodes, onSelectNode, selectedNodeId }: PNodeTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PNodeStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('health');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSorted = useMemo(() => {
    let result = nodes.filter(node => {
      const matchesSearch = 
        node.id.toLowerCase().includes(search.toLowerCase()) ||
        node.ip.includes(search);
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'status':
          const statusOrder = { online: 0, unstable: 1, offline: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'uptime':
          comparison = a.metrics.uptime - b.metrics.uptime;
          break;
        case 'latency':
          comparison = a.metrics.latency - b.metrics.latency;
          break;
        case 'health':
          comparison = a.health.total - b.health.total;
          break;
        case 'lastSeen':
          comparison = new Date(a.metrics.lastSeen).getTime() - new Date(b.metrics.lastSeen).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [nodes, search, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'opacity-100' : 'opacity-40'}`} />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PNodeStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="unstable">Unstable</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredAndSorted.length} of {nodes.length} nodes
        </span>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-dense">
            <thead>
              <tr className="border-b border-border">
                <th className="w-8"></th>
                <th className="min-w-[200px]">pNode ID</th>
                <th className="w-32"><SortHeader field="status">Status</SortHeader></th>
                <th className="w-36"><SortHeader field="lastSeen">Last Seen</SortHeader></th>
                <th className="w-28"><SortHeader field="uptime">Uptime</SortHeader></th>
                <th className="w-28"><SortHeader field="latency">Latency</SortHeader></th>
                <th className="w-24"><SortHeader field="health">Health</SortHeader></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className={`cursor-pointer group ${
                    selectedNodeId === node.id ? 'bg-accent' : ''
                  }`}
                >
                  <td className="text-center">
                    {node.isSeed && (
                      <Bookmark className="h-3.5 w-3.5 text-muted-foreground fill-muted-foreground/30" />
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-xs truncate max-w-[180px]" title={node.id}>
                        {node.id.slice(0, 8)}...{node.id.slice(-8)}
                      </span>
                      <CopyButton text={node.id} />
                    </div>
                  </td>
                  <td><StatusBadge status={node.status} /></td>
                  <td className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(node.metrics.lastSeen), { addSuffix: true })}
                  </td>
                  <td>{node.metrics.uptime.toFixed(1)}%</td>
                  <td>
                    {node.metrics.latency > 0 ? `${node.metrics.latency.toFixed(0)}ms` : '—'}
                  </td>
                  <td><HealthScore health={node.health} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
