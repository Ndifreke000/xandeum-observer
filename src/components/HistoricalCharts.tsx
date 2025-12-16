import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface HistorySnapshot {
    timestamp: number;
    total_nodes: number;
    online_nodes: number;
    total_storage: number;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function HistoricalCharts() {
    const [data, setData] = useState<HistorySnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/history`);
                if (!response.ok) throw new Error('Failed to fetch history');
                const jsonData = await response.json();

                // Transform timestamp to readable time
                const formattedData = jsonData.map((item: HistorySnapshot) => ({
                    ...item,
                    time: new Date(item.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }));

                setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError("Could not load historical data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || data.length === 0) {
        return null; // Hide if no data or error
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Network Growth Chart */}
            <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Network Growth (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorNodes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total_nodes"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorNodes)"
                                    name="Total Nodes"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="online_nodes"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fillOpacity={0}
                                    name="Online Nodes"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Storage Capacity Chart */}
            <Card className="border border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Storage Capacity (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => formatBytes(value)}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: number) => [formatBytes(value), 'Storage Used']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total_storage"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorStorage)"
                                    name="Storage Used"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
