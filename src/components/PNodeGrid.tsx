import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity, Database, Trophy, Coins } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PNodeGridProps {
    nodes: PNode[];
    onSelectNode: (node: PNode) => void;
    selectedNodeId?: string;
}

export function PNodeGrid({ nodes, onSelectNode, selectedNodeId }: PNodeGridProps) {
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {nodes.map((node) => (
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
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground">Health Score</span>
                                    <span className={`font-bold ${getHealthColor(node.health.total)}`}>{node.health.total}/100</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-muted-foreground">Last Seen</span>
                                <span className="text-foreground/80">{formatDistanceToNow(new Date(node.metrics.lastSeen), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
