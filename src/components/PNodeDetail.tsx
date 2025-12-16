import { PNode } from '@/types/pnode';
import { StatusBadge } from './StatusBadge';
import { HealthScore } from './HealthScore';
import { SignalsList } from './SignalsList';
import { LatencyChart } from './LatencyChart';
import { AvailabilityTimeline } from './AvailabilityTimeline';
import { RawRPCViewer } from './RawRPCViewer';
import { CopyButton } from './CopyButton';
import { generateLatencyHistory, generateAvailabilityHistory, generateRawRPCResponses } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { X, Bookmark, Globe } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface PNodeDetailProps {
  node: PNode;
  onClose: () => void;
}

export function PNodeDetail({ node, onClose }: PNodeDetailProps) {
  const latencyData = generateLatencyHistory(node.id);
  const availabilityData = generateAvailabilityHistory(node.id);
  const rpcResponses = generateRawRPCResponses(node.id);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">pNode Details</h2>
          {node.isSeed && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              <Bookmark className="h-3 w-3" /> Seed Node
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Identity Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 group">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
              {node.id}
            </code>
            <CopyButton text={node.id} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span className="font-mono">{node.ip}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Discovered {format(new Date(node.discoveredAt), 'MMM d, yyyy')}
          </div>
        </section>

        {/* Status Summary */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Status Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="metric-card">
              <span className="text-xs text-muted-foreground block mb-1">Current Status</span>
              <StatusBadge status={node.status} />
            </div>
            <div className="metric-card">
              <span className="text-xs text-muted-foreground block mb-1">Last Response</span>
              <span className="text-sm font-mono">
                {formatDistanceToNow(new Date(node.metrics.lastSeen), { addSuffix: true })}
              </span>
            </div>
            <div className="metric-card">
              <span className="text-xs text-muted-foreground block mb-1">Response Time</span>
              <span className="text-sm font-mono">
                {node.metrics.responseTime > 0 ? `${node.metrics.responseTime.toFixed(0)}ms` : '—'}
              </span>
            </div>
            <div className="metric-card">
              <span className="text-xs text-muted-foreground block mb-1">Gossip Participation</span>
              <span className="text-sm font-mono">
                {node.metrics.gossipParticipation > 0 ? `${node.metrics.gossipParticipation.toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Health Score Breakdown */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Health Score
          </h3>
          <div className="metric-card">
            <HealthScore health={node.health} showBreakdown />
          </div>
        </section>

        {/* Monitoring Signals */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Monitoring Signals
            {node.signals.length > 0 && (
              <span className="ml-2 text-xs font-normal text-status-unstable">
                ({node.signals.length})
              </span>
            )}
          </h3>
          <SignalsList signals={node.signals} />
        </section>

        {/* Availability Analysis */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Availability (7 Days)
          </h3>
          <div className="metric-card">
            <AvailabilityTimeline data={availabilityData} />
          </div>
        </section>

        {/* Performance Analysis */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Latency (24 Hours)
          </h3>
          <div className="metric-card">
            <LatencyChart data={latencyData} />
          </div>
        </section>

        {/* Raw RPC Data */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Raw RPC Responses
          </h3>
          <RawRPCViewer responses={rpcResponses} />
        </section>
      </div>
    </div>
  );
}
