import { NodeAnalysis } from '@/types/node-analysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface NodePerformanceSignalsProps {
    analysis: NodeAnalysis;
}

export function NodePerformanceSignals({ analysis }: NodePerformanceSignalsProps) {
    const { performance } = analysis;

    if (!performance) {
        return (
            <Card className="p-6 flex flex-col h-[400px] items-center justify-center text-muted-foreground">
                <Zap className="h-12 w-12 mb-4 opacity-20" />
                <p>Performance data not available for this node.</p>
            </Card>
        );
    }

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'excellent': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'good': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'poor': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <Card className="p-6 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        Performance Signals
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Latency and reliability metrics
                    </p>
                </div>
                <Badge variant="outline" className={getTierColor(performance.performanceTier)}>
                    {performance.performanceTier.toUpperCase()}
                </Badge>
            </div>

            <div className="space-y-6">
                {/* Latency Metrics */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">Median</div>
                        <div className="font-mono font-bold text-lg">{performance.medianLatency.toFixed(2)}ms</div>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">P95</div>
                        <div className="font-mono font-bold text-lg">{performance.p95Latency ? performance.p95Latency.toFixed(2) + 'ms' : 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground mb-1">P99</div>
                        <div className="font-mono font-bold text-lg text-orange-500">{performance.p99Latency ? performance.p99Latency.toFixed(2) + 'ms' : 'N/A'}</div>
                    </div>
                </div>

                {/* Reliability */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Reliability</h3>

                    <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Failure Rate</span>
                        </div>
                        <span className="font-mono font-bold">{performance.failureRate.toFixed(2)}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Retry Success</span>
                        </div>
                        <span className="font-mono font-bold">{performance.retryPatterns.retrySuccessRate}%</span>
                    </div>
                </div>

                {/* Status Check & DevOps Insights */}
                <div className="pt-4 border-t border-border/50 space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        {performance.failureRate < 1 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-muted-foreground">
                            {performance.failureRate < 1
                                ? "Node is performing within optimal parameters."
                                : "Node is experiencing elevated failure rates."}
                        </span>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">DevOps Insights</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                            {performance.medianLatency < 100
                                ? "Low latency detected. Ideal for storage-heavy sedApps requiring fast read/write cycles."
                                : "Elevated latency. May impact performance of real-time dApps using this pNode."}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
