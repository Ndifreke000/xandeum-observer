import { PNode } from '@/types/pnode';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Trophy, Activity, Database, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ComparisonModalProps {
    nodeA: PNode;
    nodeB: PNode | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ComparisonModal({ nodeA, nodeB, isOpen, onClose }: ComparisonModalProps) {
    if (!nodeB) return null;

    const compareMetric = (valA: number, valB: number, higherIsBetter = true) => {
        if (valA === valB) return 'neutral';
        if (higherIsBetter) {
            return valA > valB ? 'A' : 'B';
        } else {
            return valA < valB ? 'A' : 'B';
        }
    };

    const winnerColor = (winner: string, current: 'A' | 'B') => {
        if (winner === 'neutral') return 'text-muted-foreground';
        return winner === current ? 'text-emerald-500 font-bold' : 'text-muted-foreground/60';
    };

    const healthWinner = compareMetric(nodeA.health.total, nodeB.health.total);
    const uptimeWinner = compareMetric(nodeA.metrics.uptime, nodeB.metrics.uptime);
    const latencyWinner = compareMetric(nodeA.metrics.latency, nodeB.metrics.latency, false);
    const storageWinner = compareMetric(nodeA.storage.committed, nodeB.storage.committed);
    const rewardsWinner = compareMetric(nodeA.credits || 0, nodeB.credits || 0);

    const WinnerBadge = ({ winner, current }: { winner: string, current: 'A' | 'B' }) => {
        if (winner === current) {
            return (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="h-3 w-3" />
                    WINNER
                </div>
            );
        }
        return <div className="h-4" />; // Spacer
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />

                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                        <Activity className="h-6 w-6 text-blue-500" />
                        NODE BENCHMARKING
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        Side-by-side performance comparison of two pNodes on the Xandeum network
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6 mt-6">
                    {/* Labels Column */}
                    <div className="flex flex-col justify-center space-y-10 pt-16">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                            <ShieldCheck className="h-4 w-4" /> Health Score
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                            <Activity className="h-4 w-4" /> Uptime
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                            <Zap className="h-4 w-4" /> Latency
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                            <Database className="h-4 w-4" /> Committed
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                            <Trophy className="h-4 w-4" /> STOINC Rewards
                        </div>
                    </div>

                    {/* Node A Column */}
                    <div className={`rounded-3xl p-6 border transition-all duration-500 ${healthWinner === 'A' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-secondary/20 border-border/50'} text-center space-y-10`}>
                        <div className="mb-4">
                            <Badge variant="outline" className="mb-2 bg-background/50">NODE A</Badge>
                            <div className="font-mono text-[10px] truncate text-muted-foreground opacity-60">{nodeA.id}</div>
                            <div className="font-black text-xl mt-1 tracking-tight">{nodeA.ip}</div>
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-3xl font-black h-12 flex items-center justify-center ${winnerColor(healthWinner, 'A')}`}>
                                {nodeA.health.total}%
                            </div>
                            <WinnerBadge winner={healthWinner} current="A" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(uptimeWinner, 'A')}`}>
                                {nodeA.metrics.uptime.toFixed(2)}%
                            </div>
                            <WinnerBadge winner={uptimeWinner} current="A" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(latencyWinner, 'A')}`}>
                                {nodeA.metrics.latency}ms
                            </div>
                            <WinnerBadge winner={latencyWinner} current="A" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(storageWinner, 'A')}`}>
                                {(nodeA.storage.committed / (1024 ** 3)).toFixed(1)} GB
                            </div>
                            <WinnerBadge winner={storageWinner} current="A" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(rewardsWinner, 'A')}`}>
                                {nodeA.credits?.toLocaleString() || 0}
                            </div>
                            <WinnerBadge winner={rewardsWinner} current="A" />
                        </div>
                    </div>

                    {/* Node B Column */}
                    <div className={`rounded-3xl p-6 border transition-all duration-500 ${healthWinner === 'B' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-secondary/20 border-border/50'} text-center space-y-10`}>
                        <div className="mb-4">
                            <Badge variant="outline" className="mb-2 bg-background/50">NODE B</Badge>
                            <div className="font-mono text-[10px] truncate text-muted-foreground opacity-60">{nodeB.id}</div>
                            <div className="font-black text-xl mt-1 tracking-tight">{nodeB.ip}</div>
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-3xl font-black h-12 flex items-center justify-center ${winnerColor(healthWinner, 'B')}`}>
                                {nodeB.health.total}%
                            </div>
                            <WinnerBadge winner={healthWinner} current="B" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(uptimeWinner, 'B')}`}>
                                {nodeB.metrics.uptime.toFixed(2)}%
                            </div>
                            <WinnerBadge winner={uptimeWinner} current="B" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(latencyWinner, 'B')}`}>
                                {nodeB.metrics.latency}ms
                            </div>
                            <WinnerBadge winner={latencyWinner} current="B" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(storageWinner, 'B')}`}>
                                {(nodeB.storage.committed / (1024 ** 3)).toFixed(1)} GB
                            </div>
                            <WinnerBadge winner={storageWinner} current="B" />
                        </div>

                        <div className="space-y-1 flex flex-col items-center">
                            <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(rewardsWinner, 'B')}`}>
                                {nodeB.credits?.toLocaleString() || 0}
                            </div>
                            <WinnerBadge winner={rewardsWinner} current="B" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-black text-blue-500 uppercase tracking-tighter mr-2">Benchmarking Analysis:</span>
                        {healthWinner === 'A' ? 'Node A' : healthWinner === 'B' ? 'Node B' : 'Both nodes'} demonstrate superior overall stability.
                        {storageWinner === 'A' ? ' Node A' : storageWinner === 'B' ? ' Node B' : ' Both'} provide significant storage commitment, which is critical for Xandeum's exabyte-scale mission.
                        {latencyWinner === 'A' ? ' Node A' : latencyWinner === 'B' ? ' Node B' : ' Both'} offer ultra-low latency, ensuring high-performance dApp interactions.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
