import { PerformanceSignals as PerformanceSignalsType } from '@/types/contract';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { formatLatency, getPerformanceTierColor } from '@/lib/contract-utils';
import { Gauge, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';

interface PerformanceSignalsProps {
    performance: PerformanceSignalsType;
}

export function PerformanceSignals({ performance }: PerformanceSignalsProps) {
    const tierColor = getPerformanceTierColor(performance.performanceTier);
    const tierLabels = {
        excellent: 'Excellent',
        good: 'Good',
        poor: 'Poor',
    };

    // Sample latency data for chart
    const chartData =
        performance.latencyDistribution.length > 48
            ? performance.latencyDistribution.filter((_, idx) => idx % 6 === 0)
            : performance.latencyDistribution;

    const formattedChartData = chartData.map(point => ({
        time: new Date(point.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
        }),
        latency: point.latency,
    }));

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold mb-1">Performance Signals</h2>
                        <p className="text-sm text-muted-foreground">
                            Latency metrics, failure rates, and retry patterns
                        </p>
                    </div>
                    <Badge className={tierColor}>{tierLabels[performance.performanceTier]}</Badge>
                </div>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Median Latency */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            <span>Median</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {performance.medianLatency}
                            </div>
                            <div className="text-xs text-muted-foreground">ms</div>
                        </div>
                    </div>

                    {/* P95 Latency */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            <span>P95</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {performance.p95Latency}
                            </div>
                            <div className="text-xs text-muted-foreground">ms</div>
                        </div>
                    </div>

                    {/* P99 Latency */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            <span>P99</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {performance.p99Latency}
                            </div>
                            <div className="text-xs text-muted-foreground">ms</div>
                        </div>
                    </div>

                    {/* Failure Rate */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Failures</span>
                        </div>
                        <div className="pl-6">
                            <div
                                className={`text-2xl font-mono font-semibold ${performance.failureRate > 5
                                        ? 'text-[hsl(var(--status-offline))]'
                                        : performance.failureRate > 1
                                            ? 'text-[hsl(var(--status-unstable))]'
                                            : 'text-[hsl(var(--status-online))]'
                                    }`}
                            >
                                {performance.failureRate}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {performance.totalFailures} total
                            </div>
                        </div>
                    </div>
                </div>

                {/* Latency Chart */}
                <div className="pt-4">
                    <h3 className="text-sm font-medium mb-3">Latency Distribution Over Time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={formattedChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            {/* Reference lines for thresholds */}
                            <ReferenceLine
                                y={100}
                                stroke="hsl(var(--status-unstable))"
                                strokeDasharray="3 3"
                                label={{ value: 'Good threshold', fontSize: 10 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="latency"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Retry Patterns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Retry Stats */}
                    <div className="space-y-2 bg-surface-inset p-4 rounded">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <RotateCcw className="h-4 w-4" />
                            <span>Retry Patterns</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-muted-foreground text-xs">Avg Retries</div>
                                <div className="font-mono font-semibold">
                                    {performance.retryPatterns.averageRetries}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs">Max Retries</div>
                                <div className="font-mono font-semibold">
                                    {performance.retryPatterns.maxRetries}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs">Success Rate</div>
                                <div className="font-mono font-semibold">
                                    {performance.retryPatterns.retrySuccessRate}%
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs">Backoff</div>
                                <div className="font-mono font-semibold">
                                    {performance.retryPatterns.backoffDetected ? (
                                        <span className="text-[hsl(var(--status-online))]">Detected</span>
                                    ) : (
                                        <span className="text-muted-foreground">None</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Tiers Guide */}
                    <div className="space-y-2 bg-surface-inset p-4 rounded">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Performance Tiers</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[hsl(var(--status-online))]">Excellent</span>
                                <span className="text-muted-foreground">&lt;50ms, &lt;1% failures</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[hsl(var(--chart-1))]">Good</span>
                                <span className="text-muted-foreground">&lt;150ms, &lt;5% failures</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[hsl(var(--status-offline))]">Poor</span>
                                <span className="text-muted-foreground">&gt;150ms or &gt;5% failures</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Explanation */}
                <div className="text-xs text-muted-foreground bg-surface-subtle p-3 rounded">
                    <strong>About Latency Percentiles:</strong> P95 = 95% of requests complete faster
                    than this; P99 = 99% complete faster. Backoff detection identifies exponentially
                    increasing wait times between retries, which is a best practice for resilient systems.
                </div>
            </div>
        </Card>
    );
}
