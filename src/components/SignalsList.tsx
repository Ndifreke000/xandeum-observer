import { PNodeSignal } from '@/types/pnode';
import { AlertTriangle, AlertCircle, Wifi, Clock, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SignalsListProps {
  signals: PNodeSignal[];
}

export function SignalsList({ signals }: SignalsListProps) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No active signals
      </p>
    );
  }

  const getIcon = (type: PNodeSignal['type']) => {
    switch (type) {
      case 'disconnect': return Wifi;
      case 'latency_spike': return Clock;
      case 'inactivity': return AlertCircle;
      case 'gossip_dropout': return Radio;
    }
  };

  const sortedSignals = [...signals].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-2">
      {sortedSignals.map((signal, index) => {
        const Icon = getIcon(signal.type);
        return (
          <div
            key={index}
            className={`flex items-start gap-3 p-2.5 rounded-md border ${
              signal.severity === 'critical' 
                ? 'bg-status-offline/5 border-status-offline/20' 
                : 'bg-status-unstable/5 border-status-unstable/20'
            }`}
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${
              signal.severity === 'critical' ? 'text-status-offline' : 'text-status-unstable'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{signal.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
              </p>
            </div>
            <span className={`text-xs font-medium uppercase ${
              signal.severity === 'critical' ? 'text-status-offline' : 'text-status-unstable'
            }`}>
              {signal.severity}
            </span>
          </div>
        );
      })}
    </div>
  );
}
