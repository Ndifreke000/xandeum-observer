import { LatencyDataPoint } from '@/types/pnode';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface LatencyChartProps {
  data: LatencyDataPoint[];
}

export function LatencyChart({ data }: LatencyChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    time: format(new Date(d.timestamp), 'HH:mm'),
    fullTime: format(new Date(d.timestamp), 'MMM d, HH:mm'),
  }));

  const avgLatency = Math.round(data.reduce((sum, d) => sum + d.latency, 0) / data.length);
  const maxLatency = Math.max(...data.map(d => d.latency));
  const spikeCount = data.filter(d => d.isSpike).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Avg</span>
          <span className="ml-2 font-mono">{avgLatency}ms</span>
        </div>
        <div>
          <span className="text-muted-foreground">Max</span>
          <span className="ml-2 font-mono">{maxLatency}ms</span>
        </div>
        <div>
          <span className="text-muted-foreground">Spikes</span>
          <span className={`ml-2 font-mono ${spikeCount > 3 ? 'text-status-unstable' : ''}`}>
            {spikeCount}
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => `${v}ms`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelFormatter={(_, payload) => payload[0]?.payload?.fullTime || ''}
              formatter={(value: number) => [`${value}ms`, 'Latency']}
            />
            <ReferenceLine 
              y={100} 
              stroke="hsl(var(--status-unstable))" 
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <ReferenceLine 
              y={avgLatency} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              strokeOpacity={0.3}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="hsl(var(--chart-1))"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
