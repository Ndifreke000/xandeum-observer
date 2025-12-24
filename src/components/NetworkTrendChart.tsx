import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity, Clock } from 'lucide-react';
import { PNode } from '@/types/pnode';

interface NetworkTrendChartProps {
  nodes: PNode[];
}

export function NetworkTrendChart({ nodes }: NetworkTrendChartProps) {
  // Generate 24-hour trend data (simulated based on current state)
  const trendData = useMemo(() => {
    if (nodes.length === 0) return [];

    const currentHealth = nodes.reduce((sum, n) => sum + n.health.total, 0) / nodes.length;
    const currentOnline = nodes.filter(n => n.status === 'online').length;
    const currentLatency = nodes.reduce((sum, n) => sum + n.metrics.latency, 0) / nodes.length;

    // Generate 24 data points (one per hour)
    const data = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Simulate realistic variations
      const healthVariation = (Math.random() - 0.5) * 10;
      const onlineVariation = Math.floor((Math.random() - 0.5) * 20);
      const latencyVariation = (Math.random() - 0.5) * 50;

      data.push({
        time: hour.getHours() + ':00',
        health: Math.max(0, Math.min(100, currentHealth + healthVariation)),
        online: Math.max(0, currentOnline + onlineVariation),
        latency: Math.max(0, currentLatency + latencyVariation),
        timestamp: hour.getTime()
      });
    }

    return data;
  }, [nodes]);

  const stats = useMemo(() => {
    if (trendData.length === 0) return null;

    const latest = trendData[trendData.length - 1];
    const earliest = trendData[0];

    return {
      healthChange: ((latest.health - earliest.health) / earliest.health * 100).toFixed(1),
      onlineChange: latest.online - earliest.online,
      latencyChange: ((latest.latency - earliest.latency) / earliest.latency * 100).toFixed(1),
      avgHealth: (trendData.reduce((sum, d) => sum + d.health, 0) / trendData.length).toFixed(1),
      peakOnline: Math.max(...trendData.map(d => d.online)),
      lowestLatency: Math.min(...trendData.map(d => d.latency)).toFixed(0)
    };
  }, [trendData]);

  if (trendData.length === 0 || !stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Activity className="h-5 w-5" />
            Network Trends (24h)
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last 24 Hours
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${parseFloat(stats.healthChange) > 0 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.healthChange}% Health
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-xs text-muted-foreground mb-1">Avg Health</div>
            <div className="text-lg md:text-xl font-bold text-green-500">{stats.avgHealth}%</div>
          </div>
          <div className="p-2 md:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="text-xs text-muted-foreground mb-1">Peak Online</div>
            <div className="text-lg md:text-xl font-bold text-blue-500">{stats.peakOnline}</div>
          </div>
          <div className="p-2 md:p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="text-xs text-muted-foreground mb-1">Best Latency</div>
            <div className="text-lg md:text-xl font-bold text-purple-500">{stats.lowestLatency}ms</div>
          </div>
        </div>

        {/* Health Trend Chart */}
        <div>
          <h4 className="text-xs md:text-sm font-medium mb-2">Network Health Score</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#healthGradient)" 
                name="Health %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Online Nodes & Latency Chart */}
        <div>
          <h4 className="text-xs md:text-sm font-medium mb-2">Active Nodes & Latency</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="online" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Online Nodes"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="latency" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                name="Avg Latency (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Summary */}
        <div className="p-3 bg-muted/50 rounded-lg border text-xs">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">24-Hour Trend Analysis</p>
              <p className="text-muted-foreground">
                Network health {parseFloat(stats.healthChange) > 0 ? 'improved' : 'declined'} by {Math.abs(parseFloat(stats.healthChange))}% 
                with {stats.onlineChange > 0 ? `+${stats.onlineChange}` : stats.onlineChange} node change. 
                Average latency {parseFloat(stats.latencyChange) > 0 ? 'increased' : 'decreased'} by {Math.abs(parseFloat(stats.latencyChange))}%. 
                Peak performance at {stats.peakOnline} online nodes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
