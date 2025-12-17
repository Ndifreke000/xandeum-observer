import { NodeAnalysis } from '@/types/node-analysis';
import { Card } from '@/components/ui/card';
import { Database, HardDrive, Server } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StorageAnalysisProps {
    analysis: NodeAnalysis;
    storage: {
        used: number;
        committed: number;
        usagePercent: number;
    };
}

export function StorageAnalysis({ analysis, storage }: StorageAnalysisProps) {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const data = [
        { name: 'Used Storage', value: storage.used, color: '#3b82f6' }, // Blue
        { name: 'Committed (Reserved)', value: storage.committed - storage.used, color: '#a855f7' }, // Purple
        { name: 'Available', value: (storage.committed / storage.usagePercent) - storage.committed, color: '#e2e8f0' }, // Gray (approximate total based on percent)
    ];

    // If usage percent is 0 or invalid, fallback
    const totalEstimated = storage.usagePercent > 0 ? storage.committed / storage.usagePercent : storage.committed * 1.5;
    const available = totalEstimated - storage.committed;

    const chartData = [
        { name: 'Used', value: storage.used },
        { name: 'Free', value: available > 0 ? available : 0 }
    ];

    return (
        <Card className="p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        Storage Metrics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Capacity and utilization breakdown
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">
                        {(storage.usagePercent * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Utilization
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell key="used" fill="hsl(var(--primary))" />
                                <Cell key="free" fill="hsl(var(--muted))" />
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => formatBytes(value)}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="font-bold text-sm">{formatBytes(totalEstimated)}</span>
                    </div>
                </div>

                <div className="w-1/2 space-y-4 pl-4 border-l border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Used</span>
                        </div>
                        <span className="font-mono font-medium text-sm">{formatBytes(storage.used)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Committed</span>
                        </div>
                        <span className="font-mono font-medium text-sm">{formatBytes(storage.committed)}</span>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Storage Health</div>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${storage.usagePercent > 0.9 ? 'bg-red-500' : 'bg-green-500'}`} />
                            <span className="text-sm font-medium">
                                {storage.usagePercent > 0.9 ? 'Critical' : 'Healthy'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
