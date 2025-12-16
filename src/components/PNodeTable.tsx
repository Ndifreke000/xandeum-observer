import { useState, useMemo } from 'react';
import { PNode, PNodeStatus } from '@/types/pnode';
import { StatusBadge } from './StatusBadge';
import { HealthScore } from './HealthScore';
import { CopyButton } from './CopyButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Search, Bookmark, Wifi, WifiOff, Activity, Server, Clock, Copy, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PNodeTableProps {
  nodes: PNode[];
  onSelectNode: (node: PNode) => void;
  selectedNodeId?: string;
}

type SortField = 'status' | 'uptime' | 'latency' | 'health' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

export function PNodeTable({ nodes, onSelectNode, selectedNodeId }: PNodeTableProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PNodeStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('health');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied ID",
      description: "pNode ID copied to clipboard",
      duration: 2000,
    });
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredAndSorted;
    let content = '';
    let filename = `pnodes_export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename += '.json';
    } else {
      // CSV
      const headers = ['ID', 'IP', 'Status', 'Uptime', 'Latency', 'Health', 'Last Seen'];
      const rows = data.map(n => [
        n.id,
        n.ip,
        n.status,
        n.metrics.uptime,
        n.metrics.latency,
        n.health.total,
        n.metrics.lastSeen
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename += '.csv';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${data.length} nodes to ${filename}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="w-3 h-3 mr-1" />;
      case 'unstable': return <Activity className="w-3 h-3 mr-1" />;
      case 'offline': return <WifiOff className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredAndSorted = useMemo(() => {
    const result = nodes.filter(node => {

      const matchesSearch =
        node.id.toLowerCase().includes(search.toLowerCase()) ||
        node.ip.includes(search);
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'status': {
          const statusOrder = { online: 0, unstable: 1, offline: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Export Data">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredAndSorted.length} of {nodes.length} nodes
          </span>
        </div>
      </div>

      <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-muted-foreground border-b bg-muted/30">
            <div className="col-span-4 pl-2">PNODE ID</div>
            <div className="col-span-2"><SortHeader field="status">Status</SortHeader></div>
            <div className="col-span-2"><SortHeader field="lastSeen">Last Seen</SortHeader></div>
            <div className="col-span-2"><SortHeader field="uptime">Uptime</SortHeader></div>
            <div className="col-span-1"><SortHeader field="latency">Latency</SortHeader></div>
            <div className="col-span-1 text-right pr-2"><SortHeader field="health">Health</SortHeader></div>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border/50">
              {filteredAndSorted.map((node) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent/50 hover:shadow-sm cursor-pointer transition-all duration-200 text-sm group ${selectedNodeId === node.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                    }`}
                >
                  <div className="col-span-4 font-mono text-xs flex items-center gap-2 truncate pl-2">
                    {node.isSeed && <Bookmark className="h-3.5 w-3.5 text-muted-foreground fill-muted-foreground/30 shrink-0" />}
                    <span className="truncate text-foreground/80">{node.id.slice(0, 8)}...{node.id.slice(-8)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => copyToClipboard(e, node.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="outline" className={`status-badge ${node.status} border-0`}>
                      {getStatusIcon(node.status)}
                      {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(node.metrics.lastSeen), { addSuffix: true })}
                  </div>
                  <div className="col-span-2 font-mono text-xs">
                    {node.metrics.uptime.toFixed(1)}%
                  </div>
                  <div className="col-span-1 font-mono text-xs text-muted-foreground">
                    {node.metrics.latency > 0 ? `${Math.round(node.metrics.latency)}ms` : '-'}
                  </div>
                  <div className={`col-span-1 text-right font-bold pr-2 ${getHealthColor(node.health.total)}`}>
                    {node.health.total}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="divide-y divide-border/50">
              {filteredAndSorted.map((node) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className={`p-4 space-y-3 active:bg-muted/50 transition-colors ${selectedNodeId === node.id ? 'bg-primary/5' : ''
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Server className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs truncate text-foreground/90">{node.id.slice(0, 8)}...{node.id.slice(-8)}</span>
                    </div>
                    <Badge variant="outline" className={`status-badge ${node.status} border-0 shrink-0 ml-2`}>
                      {getStatusIcon(node.status)}
                      {node.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(node.metrics.lastSeen), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-muted-foreground">Health:</span>
                      <span className={`font-bold ${getHealthColor(node.health.total)}`}>{node.health.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
