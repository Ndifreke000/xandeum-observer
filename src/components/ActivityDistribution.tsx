import { ActivityDistribution as ActivityDistributionType } from '@/types/contract';
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
} from 'recharts';
import { formatNumber, getActivityClassificationColor } from '@/lib/contract-utils';
import { TrendingUp, Zap, BarChart3 } from 'lucide-react';

interface ActivityDistributionProps {
    activity: ActivityDistributionType;
}

export function ActivityDistribution({ activity }: ActivityDistributionProps) {
    // Prepare chart data (sample every 6th bucket for readability if > 48 buckets)
    const chartData = activity.timeBuckets.length > 48
        ? activity.timeBuckets.filter((_, idx) => idx % 6 === 0)
        : activity.timeBuckets;

    const formattedChartData = chartData.map(bucket => ({
        time: new Date(bucket.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
        }),
        calls: bucket.callCount,
    }));

    const classificationColor = getActivityClassificationColor(activity.classification);
    const classificationLabels = {
        burst: 'Burst Activity',
        steady: 'Steady Activity',
        sporadic: 'Sporadic Activity',
    };

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold mb-1">Activity Distribution</h2>
                        <p className="text-sm text-muted-foreground">
                            Storage call patterns and temporal distribution
                        </p>
                    </div>
                    <Badge className={classificationColor}>
                        {classificationLabels[activity.classification]}
                    </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Calls */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            <span>Total Calls</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {formatNumber(activity.totalCalls)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {formatNumber(activity.totalStorageCalls)} storage-related
                            </div>
                        </div>
                    </div>

                    {/* Average Rate */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>Average Rate</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {activity.averageCallsPerHour.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">calls per hour</div>
                        </div>
                    </div>

                    {/* Peak Activity */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Zap className="h-4 w-4" />
                            <span>Peak Activity</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {formatNumber(activity.peakActivity.callCount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(activity.peakActivity.timestamp).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Series Chart */}
                <div className="pt-4">
                    <h3 className="text-sm font-medium mb-3">Call Volume Over Time</h3>
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
                            <Line
                                type="monotone"
                                dataKey="calls"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Burst Periods */}
                {activity.burstPeriods.length > 0 && (
                    <div className="pt-2 space-y-2">
                        <h3 className="text-sm font-medium">Burst Periods Detected</h3>
                        <div className="space-y-1">
                            {activity.burstPeriods.slice(0, 3).map((burst, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs bg-surface-inset p-2 rounded"
                                >
                                    <span className="text-muted-foreground">
                                        {new Date(burst.start).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                        })}{' '}
                                        →{' '}
                                        {new Date(burst.end).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                        })}
                                    </span>
                                    <Badge variant="outline" className="text-[hsl(var(--status-unstable))]">
                                        {burst.intensity.toFixed(1)}x intensity
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inline Explanation */}
                <div className="text-xs text-muted-foreground bg-surface-subtle p-3 rounded">
                    <strong>About Activity Classification:</strong> Burst = high variability with sudden
                    spikes; Steady = consistent call rate over time; Sporadic = irregular patterns.
                    Intensity shows ratio compared to average activity.
                </div>
            </div>
        </Card>
    );
}
