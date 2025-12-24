import { useState } from 'react';
import { PNode } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Coins, Database, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LeaderboardProps {
    nodes: PNode[];
    onSelectNode: (node: PNode) => void;
}

export function Leaderboard({ nodes, onSelectNode }: LeaderboardProps) {
    const [showAll, setShowAll] = useState(false);
    
    const sortedNodes = [...nodes]
        .sort((a, b) => (b.credits || 0) - (a.credits || 0));
    
    const displayNodes = showAll ? sortedNodes.slice(0, 10) : sortedNodes.slice(0, 5);

    if (sortedNodes.length === 0) return null;

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Top Performers</h2>
                    <Badge variant="secondary" className="text-xs">
                        {sortedNodes.length} Total
                    </Badge>
                </div>
                {sortedNodes.length > 5 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                        className="gap-2"
                    >
                        {showAll ? (
                            <>
                                Show Less
                                <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Show More
                                <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {displayNodes.map((node, index) => (
                    <Card
                        key={node.id}
                        onClick={() => onSelectNode(node)}
                        className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br border ${getRankColor(index)}`}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full bg-background/50 border border-border/50 ${getTrophyColor(index)}`}>
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">#{index + 1}</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-background/50 border-border/50 text-[10px]">
                                    <Activity className="w-2.5 h-2.5 mr-1 text-green-500" />
                                    {node.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="mb-3">
                                <div className="font-mono text-xs font-bold truncate">
                                    {node.ip !== 'unknown' ? node.ip : node.id.slice(0, 12)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Coins className="w-3 h-3 text-yellow-500" />
                                        Credits
                                    </div>
                                    <div className="font-mono font-bold text-sm">{node.credits?.toLocaleString() || 0}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Database className="w-3 h-3 text-purple-500" />
                                        Storage
                                    </div>
                                    <div className="font-mono font-bold text-sm">
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
