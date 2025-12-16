import { ReadWriteBehavior as ReadWriteBehaviorType } from '@/types/contract';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { formatNumber, getReadWriteClassificationColor } from '@/lib/contract-utils';
import { BookOpen, Edit, TrendingUp } from 'lucide-react';

interface ReadWriteBehaviorProps {
    readWrite: ReadWriteBehaviorType;
}

export function ReadWriteBehavior({ readWrite }: ReadWriteBehaviorProps) {
    const classificationColor = getReadWriteClassificationColor(readWrite.classification);
    const classificationLabels = {
        'read-heavy': 'Read-Heavy',
        'write-heavy': 'Write-Heavy',
        balanced: 'Balanced',
    };

    // Sample temporal data for chart (every 12th point if > 48)
    const chartData =
        readWrite.temporalTrend.length > 48
            ? readWrite.temporalTrend.filter((_, idx) => idx % 12 === 0)
            : readWrite.temporalTrend;

    const formattedChartData = chartData.map(point => ({
        time: new Date(point.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
        reads: point.readRatio,
        writes: 100 - point.readRatio,
    }));

    const shiftDirectionLabels = {
        'more-reads': '→ More Reads',
        'more-writes': '→ More Writes',
        stable: 'Stable',
    };

    const shiftColor =
        readWrite.recentShift.direction === 'more-reads'
            ? 'text-[hsl(var(--chart-1))]'
            : readWrite.recentShift.direction === 'more-writes'
                ? 'text-[hsl(var(--status-unstable))]'
                : 'text-muted-foreground';

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold mb-1">Read/Write Behavior</h2>
                        <p className="text-sm text-muted-foreground">
                            Operation type distribution and temporal patterns
                        </p>
                    </div>
                    <Badge className={classificationColor}>
                        {classificationLabels[readWrite.classification]}
                    </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Reads */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>Read Operations</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {formatNumber(readWrite.totalReads)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {((readWrite.totalReads / (readWrite.totalReads + readWrite.totalWrites)) * 100).toFixed(1)}%
                                of total
                            </div>
                        </div>
                    </div>

                    {/* Total Writes */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Edit className="h-4 w-4" />
                            <span>Write Operations</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {formatNumber(readWrite.totalWrites)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {((readWrite.totalWrites / (readWrite.totalReads + readWrite.totalWrites)) * 100).toFixed(1)}%
                                of total
                            </div>
                        </div>
                    </div>

                    {/* Read/Write Ratio */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>Read/Write Ratio</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {readWrite.readWriteRatio.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">reads per write</div>
                        </div>
                    </div>
                </div>

                {/* Stacked Bar Chart */}
                <div className="pt-4">
                    <h3 className="text-sm font-medium mb-3">Read/Write Distribution Over Time</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={formattedChartData}>
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
                            <Legend />
                            <Bar dataKey="reads" stackId="a" fill="hsl(var(--chart-1))" name="Reads %" />
                            <Bar
                                dataKey="writes"
                                stackId="a"
                                fill="hsl(var(--status-unstable))"
                                name="Writes %"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Shift Indicator */}
                <div className="flex items-center justify-between bg-surface-inset p-3 rounded">
                    <div>
                        <div className="text-sm font-medium">Recent Trend (Last 24h)</div>
                        <div className="text-xs text-muted-foreground">
                            Compared to previous 24-hour period
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-semibold ${shiftColor}`}>
                            {shiftDirectionLabels[readWrite.recentShift.direction]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {readWrite.recentShift.magnitude.toFixed(1)}% change
                        </div>
                    </div>
                </div>

                {/* Inline Explanation */}
                <div className="text-xs text-muted-foreground bg-surface-subtle p-3 rounded">
                    <strong>About Classification:</strong> Read-Heavy = ratio &gt; 3:1; Write-Heavy =
                    ratio &lt; 1:2; Balanced = between these ranges. Recent trend shows shifts in the
                    last 24 hours compared to the previous period.
                </div>
            </div>
        </Card>
    );
}
