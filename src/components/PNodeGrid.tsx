import { useState, useMemo } from 'react';
import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity, Database, Trophy, Coins, ArrowUpDown, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HealthScoreBadge } from '@/components/HealthScoreBadge';
import { calculateHealthScore } from '@/services/health-score';

interface PNodeGridProps {
    nodes: PNode[];
    onSelectNode: (node: PNode) => void;
    onCompareNode: (node: PNode) => void;
    selectedNodeId?: string;
}

type SortOption = 'rank' | 'credits' | 'storage' | 'health';
type StatusFilter = 'all' | 'online' | 'unstable' | 'offline';

export function PNodeGrid({ nodes, onSelectNode, onCompareNode, selectedNodeId }: PNodeGridProps) {
    const [sortBy, setSortBy] = useState<SortOption>('rank');
    const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');

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

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const processedNodes = useMemo(() => {
        let result = [...nodes];

        // Filter
        if (filterStatus !== 'all') {
            result = result.filter(n => n.status === filterStatus);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'rank':
                    return (a.rank || 999) - (b.rank || 999);
                case 'credits':
                    return (b.credits || 0) - (a.credits || 0);
                case 'storage':
                    return (b.storage?.committed || 0) - (a.storage?.committed || 0);
                case 'health':
                    return (b.health.total || 0) - (a.health.total || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [nodes, sortBy, filterStatus]);

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                            <DropdownMenuRadioItem value="rank">Rank</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="credits">Rewards</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="storage">Storage</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="health">Health Score</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                            <Filter className="w-3.5 h-3.5" />
                            Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filterStatus} onValueChange={(v) => setFilterStatus(v as StatusFilter)}>
                            <DropdownMenuRadioItem value="all">All Nodes</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="online">Online</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="unstable">Unstable</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="offline">Offline</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="ml-auto text-xs text-muted-foreground">
                    Showing {processedNodes.length} of {nodes.length} nodes
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {processedNodes.map((node) => (
                    <Card
                        key={node.id}
                        onClick={() => onSelectNode(node)}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 group ${selectedNodeId === node.id ? 'ring-2 ring-primary border-primary' : 'border-border/50'
                            }`}
                    >
                        <CardContent className="p-5 space-y-4">
                            {/* Header: IP & Rank */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-sm font-medium text-foreground/90 truncate max-w-[180px]" title={node.ip}>
                                            {node.ip !== 'unknown' ? node.ip : node.id.slice(0, 12) + '...'}
                                        </span>
                                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${node.status} border-0 bg-secondary/50`}>
                                            {getStatusIcon(node.status)}
                                            {node.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        Version: <span className="text-foreground/80">{node.version?.split('-')[0] || '0.0.0'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary hover:bg-primary/20">
                                        <Trophy className="w-3 h-3 mr-1" />
                                        #{node.rank || '-'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4 py-2 border-t border-border/40 border-b">
                                <div>
                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Network Rewards</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                        <span className="text-sm font-bold font-mono">{node.credits?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Committed</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Database className="w-3.5 h-3.5 text-purple-500" />
                                        <span className="text-sm font-bold font-mono">{formatBytes(node.storage?.committed || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Health & Last Seen */}
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <HealthScoreBadge score={calculateHealthScore(node)} size="sm" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] text-muted-foreground">Last Seen</span>
                                    <span className="text-foreground/80">
                                        {node.metrics.lastSeen && !isNaN(new Date(node.metrics.lastSeen).getTime())
                                            ? formatDistanceToNow(new Date(node.metrics.lastSeen), { addSuffix: true })
                                            : 'N/A'}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCompareNode(node);
                                        }}
                                    >
                                        <Activity className="w-3 h-3" />
                                        Compare
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
