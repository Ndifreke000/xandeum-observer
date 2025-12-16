import { AvailabilityDataPoint, PNodeStatus } from '@/types/pnode';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AvailabilityTimelineProps {
  data: AvailabilityDataPoint[];
}

export function AvailabilityTimeline({ data }: AvailabilityTimelineProps) {
  const getStatusColor = (status: PNodeStatus) => {
    switch (status) {
      case 'online': return 'bg-status-online';
      case 'unstable': return 'bg-status-unstable';
      case 'offline': return 'bg-status-offline';
    }
  };

  const onlineCount = data.filter(d => d.status === 'online').length;
  const unstableCount = data.filter(d => d.status === 'unstable').length;
  const offlineCount = data.filter(d => d.status === 'offline').length;
  const uptimePercent = ((onlineCount / data.length) * 100).toFixed(1);

  // Group consecutive statuses for cleaner display
  const grouped: { status: PNodeStatus; count: number; startTime: string; endTime: string }[] = [];
  data.forEach((point, i) => {
    const last = grouped[grouped.length - 1];
    if (last && last.status === point.status) {
      last.count++;
      last.endTime = point.timestamp;
    } else {
      grouped.push({ 
        status: point.status, 
        count: 1, 
        startTime: point.timestamp,
        endTime: point.timestamp 
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Uptime (7d)</span>
          <span className="ml-2 font-mono font-medium">{uptimePercent}%</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-status-online" />
            Online: {onlineCount}h
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-status-unstable" />
            Unstable: {unstableCount}h
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-status-offline" />
            Offline: {offlineCount}h
          </span>
        </div>
      </div>

      <div className="flex h-8 rounded overflow-hidden border border-border">
        {grouped.map((segment, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={`${getStatusColor(segment.status)} transition-opacity hover:opacity-80`}
                style={{ width: `${(segment.count / data.length) * 100}%` }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <div className="font-medium capitalize">{segment.status}</div>
                <div className="text-muted-foreground">
                  {format(new Date(segment.startTime), 'MMM d, HH:mm')} - {format(new Date(segment.endTime), 'HH:mm')}
                </div>
                <div className="text-muted-foreground">{segment.count} hour(s)</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(new Date(data[0]?.timestamp || Date.now()), 'MMM d')}</span>
        <span>{format(new Date(data[data.length - 1]?.timestamp || Date.now()), 'MMM d')}</span>
      </div>
    </div>
  );
}
