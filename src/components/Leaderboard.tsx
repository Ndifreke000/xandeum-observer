import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Coins, Database, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaderboardProps {
    nodes: PNode[];
    onSelectNode: (node: PNode) => void;
}

export function Leaderboard({ nodes, onSelectNode }: LeaderboardProps) {
    const topNodes = [...nodes]
        .sort((a, b) => (b.credits || 0) - (a.credits || 0))
        .slice(0, 3);

    if (topNodes.length === 0) return null;

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/50';
            case 1: return 'from-slate-300/20 to-slate-400/5 border-slate-300/50';
            case 2: return 'from-amber-700/20 to-amber-800/5 border-amber-700/50';
            default: return 'from-primary/10 to-primary/5 border-primary/20';
        }
    };

    const getTrophyColor = (index: number) => {
        switch (index) {
            case 0: return 'text-yellow-500';
            case 1: return 'text-slate-300';
            case 2: return 'text-amber-700';
            default: return 'text-primary';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Top Performers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topNodes.map((node, index) => (
                    <Card
                        key={node.id}
                        onClick={() => onSelectNode(node)}
                        className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br border ${getRankColor(index)}`}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full bg-background/50 border border-border/50 ${getTrophyColor(index)}`}>
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rank #{index + 1}</div>
                                        <div className="font-mono text-sm font-bold truncate max-w-[120px]">{node.ip !== 'unknown' ? node.ip : node.id.slice(0, 8)}</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-background/50 border-border/50">
                                    <Activity className="w-3 h-3 mr-1 text-green-500" />
                                    {node.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                        Rewards
                                    </div>
                                    <div className="font-mono font-bold">{node.credits?.toLocaleString() || 0}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Database className="w-3.5 h-3.5 text-purple-500" />
                                        Storage
                                    </div>
                                    <div className="font-mono font-bold">
                                        {node.storage?.committed ? (node.storage.committed / (1024 ** 3)).toFixed(1) + ' GB' : '0 GB'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
