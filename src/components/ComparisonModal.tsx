import { PNode } from '@/types/pnode';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Trophy, Activity, Database, Zap, ShieldCheck } from 'lucide-react';

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
        return winner === current ? 'text-emerald-500 font-bold' : 'text-muted-foreground';
    };

    const healthWinner = compareMetric(nodeA.health.total, nodeB.health.total);
    const uptimeWinner = compareMetric(nodeA.metrics.uptime, nodeB.metrics.uptime);
    const latencyWinner = compareMetric(nodeA.metrics.latency, nodeB.metrics.latency, false);
    const storageWinner = compareMetric(nodeA.storage.committed, nodeB.storage.committed);
    const rewardsWinner = compareMetric(nodeA.credits || 0, nodeB.credits || 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6 text-blue-500" />
                        Node Benchmarking
                    </DialogTitle>
                    <DialogDescription>
                        Side-by-side performance comparison of two pNodes
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6 mt-4">
                    {/* Labels Column */}
                    <div className="flex flex-col justify-center space-y-8 pt-12">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground h-12">
                            <ShieldCheck className="h-4 w-4" /> Health Score
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground h-12">
                            <Activity className="h-4 w-4" /> Uptime
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground h-12">
                            <Zap className="h-4 w-4" /> Latency
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground h-12">
                            <Database className="h-4 w-4" /> Committed Storage
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground h-12">
                            <Trophy className="h-4 w-4" /> STOINC Rewards
                        </div>
                    </div>

                    {/* Node A Column */}
                    <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50 text-center space-y-8">
                        <div className="mb-4">
                            <Badge variant="outline" className="mb-2">Node A</Badge>
                            <div className="font-mono text-xs truncate text-muted-foreground">{nodeA.id.slice(0, 16)}...</div>
                            <div className="font-bold text-lg mt-1">{nodeA.ip}</div>
                        </div>

                        <div className={`text-3xl font-bold h-12 flex items-center justify-center ${winnerColor(healthWinner, 'A')}`}>
                            {nodeA.health.total}%
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(uptimeWinner, 'A')}`}>
                            {nodeA.metrics.uptime.toFixed(1)}%
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(latencyWinner, 'A')}`}>
                            {nodeA.metrics.latency}ms
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(storageWinner, 'A')}`}>
                            {(nodeA.storage.committed / (1024 ** 3)).toFixed(1)} GB
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(rewardsWinner, 'A')}`}>
                            {nodeA.credits?.toLocaleString() || 0}
                        </div>
                    </div>

                    {/* Node B Column */}
                    <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50 text-center space-y-8">
                        <div className="mb-4">
                            <Badge variant="outline" className="mb-2">Node B</Badge>
                            <div className="font-mono text-xs truncate text-muted-foreground">{nodeB.id.slice(0, 16)}...</div>
                            <div className="font-bold text-lg mt-1">{nodeB.ip}</div>
                        </div>

                        <div className={`text-3xl font-bold h-12 flex items-center justify-center ${winnerColor(healthWinner, 'B')}`}>
                            {nodeB.health.total}%
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(uptimeWinner, 'B')}`}>
                            {nodeB.metrics.uptime.toFixed(1)}%
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(latencyWinner, 'B')}`}>
                            {nodeB.metrics.latency}ms
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(storageWinner, 'B')}`}>
                            {(nodeB.storage.committed / (1024 ** 3)).toFixed(1)} GB
                        </div>
                        <div className={`text-2xl font-bold h-12 flex items-center justify-center ${winnerColor(rewardsWinner, 'B')}`}>
                            {nodeB.credits?.toLocaleString() || 0}
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-blue-500">Analysis:</span> {healthWinner === 'A' ? 'Node A' : healthWinner === 'B' ? 'Node B' : 'Both nodes'} demonstrate superior overall stability and contribution to the Xandeum network.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
