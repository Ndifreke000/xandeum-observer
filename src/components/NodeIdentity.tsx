import { NodeAnalysis } from '@/types/node-analysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/CopyButton';
import { formatRelativeTime } from '@/lib/node-utils';
import { Clock, Activity, Calendar, Server, Shield } from 'lucide-react';

interface NodeIdentityProps {
    analysis: NodeAnalysis;
}

export function NodeIdentity({ analysis }: NodeIdentityProps) {
    const { identity } = analysis;

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold mb-1">Node Identity</h2>
                    <p className="text-sm text-muted-foreground">
                        Basic information and activity timeline for this pNode
                    </p>
                </div>

                {/* Node ID */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Node ID</label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-secondary/50 rounded font-mono text-sm truncate">
                            {identity.nodeId}
                        </code>
                        <CopyButton text={identity.nodeId} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* IP Address */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{identity.ipAddress || 'Unknown'}</span>
                        </div>
                    </div>
                    {/* Version */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Version</label>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{identity.version || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                {/* Activity Status */}
                <div className="flex items-center gap-2 pt-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={identity.isActive ? 'default' : 'secondary'} className={identity.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {identity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                    {/* First Seen */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>First Seen</span>
                        </div>
                        <div className="pl-6">
                            <div className="font-mono text-sm">{formatDate(identity.firstSeen)}</div>
                            <div className="text-xs text-muted-foreground">
                                {formatRelativeTime(identity.firstSeen)}
                            </div>
                        </div>
                    </div>

                    {/* Last Seen */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Last Seen</span>
                        </div>
                        <div className="pl-6">
                            <div className="font-mono text-sm">{formatDate(identity.lastSeen)}</div>
                            <div className="text-xs text-muted-foreground">
                                {formatRelativeTime(identity.lastSeen)}
                            </div>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            <span>Uptime</span>
                        </div>
                        <div className="pl-6">
                            <div className="font-mono text-sm">
                                {identity.uptimeDays.toFixed(1)} days
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Since discovery
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
