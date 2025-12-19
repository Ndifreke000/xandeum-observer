import { NodeAnalysis } from '@/types/node-analysis';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowDownUp, Download, Upload } from 'lucide-react';

interface IOBehaviorProps {
    analysis: NodeAnalysis;
}

export function IOBehavior({ analysis }: IOBehaviorProps) {
    const { io, traffic } = analysis;

    if (!io || !traffic) {
        return (
            <Card className="p-6 flex flex-col h-[400px] items-center justify-center text-muted-foreground">
                <ArrowDownUp className="h-12 w-12 mb-4 opacity-20" />
                <p>I/O data not available for this node.</p>
            </Card>
        );
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const data = traffic.timeBuckets.map(bucket => ({
        time: new Date(bucket.timestamp).toLocaleDateString(),
        inbound: bucket.inboundBytes,
        outbound: bucket.outboundBytes,
    })).reverse();

    return (
        <Card className="p-6 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ArrowDownUp className="h-5 w-5 text-purple-500" />
                        I/O Behavior
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Inbound vs Outbound Data Transfer
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-lg font-bold flex items-center justify-end gap-1 text-blue-500">
                            <Download className="h-3 w-3" />
                            {formatBytes(io.totalInbound)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Inbound</div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold flex items-center justify-end gap-1 text-purple-500">
                            <Upload className="h-3 w-3" />
                            {formatBytes(io.totalOutbound)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Outbound</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                            formatter={(value: number) => formatBytes(value)}
                        />
                        <Area
                            type="monotone"
                            dataKey="inbound"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorInbound)"
                            stackId="1"
                        />
                        <Area
                            type="monotone"
                            dataKey="outbound"
                            stroke="#a855f7"
                            fillOpacity={1}
                            fill="url(#colorOutbound)"
                            stackId="1"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">I/O Ratio</span>
                    <span className="font-mono font-medium">
                        {io.ioRatio.toFixed(2)}
                        <span className="text-muted-foreground ml-1">
                            ({io.classification})
                        </span>
                    </span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden flex">
                    <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${(io.totalInbound / (io.totalInbound + io.totalOutbound)) * 100}%` }}
                    />
                    <div
                        className="bg-purple-500 h-full"
                        style={{ width: `${(io.totalOutbound / (io.totalInbound + io.totalOutbound)) * 100}%` }}
                    />
                </div>
            </div>
        </Card>
    );
}
