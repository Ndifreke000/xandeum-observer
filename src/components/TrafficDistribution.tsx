import { NodeAnalysis } from '@/types/node-analysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ArrowUpRight } from 'lucide-react';

interface TrafficDistributionProps {
    analysis: NodeAnalysis;
}

export function TrafficDistribution({ analysis }: TrafficDistributionProps) {
    const { traffic } = analysis;

    if (!traffic) {
        return (
            <Card className="p-6 flex flex-col h-[400px] items-center justify-center text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>Traffic data not available for this node.</p>
            </Card>
        );
    }

    const formatTimestamp = (iso: string) => {
        const date = new Date(iso);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    };

    const data = traffic.timeBuckets.map(bucket => ({
        time: formatTimestamp(bucket.timestamp),
        requests: bucket.requestCount,
        timestamp: bucket.timestamp
    })).reverse();

    const getClassificationColor = (classification: string) => {
        switch (classification) {
            case 'burst': return 'text-orange-500';
            case 'steady': return 'text-green-500';
            case 'sporadic': return 'text-yellow-500';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <Card className="p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Traffic Distribution
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Request volume over the last 7 days
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">
                        {traffic.totalRequests.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Total Requests
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="time"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        />
                        <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Pattern:</span>
                    <Badge variant="outline" className={getClassificationColor(traffic.classification)}>
                        {traffic.classification.toUpperCase()}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{Math.round(traffic.averageRequestsPerHour)}</span>
                    <span className="text-muted-foreground">req/hour (avg)</span>
                </div>
            </div>
        </Card>
    );
}
