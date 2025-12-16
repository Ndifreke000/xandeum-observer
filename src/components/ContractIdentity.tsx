import { ContractIdentity as ContractIdentityType } from '@/types/contract';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/CopyButton';
import { formatRelativeTime } from '@/lib/contract-utils';
import { Clock, Activity, Calendar } from 'lucide-react';

interface ContractIdentityProps {
    identity: ContractIdentityType;
}

export function ContractIdentity({ identity }: ContractIdentityProps) {
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
                    <h2 className="text-lg font-semibold mb-1">Contract Identity</h2>
                    <p className="text-sm text-muted-foreground">
                        Basic information and activity timeline for this contract
                    </p>
                </div>

                {/* Program ID */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Program ID</label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-surface-inset rounded font-mono text-sm truncate">
                            {identity.programId}
                        </code>
                        <CopyButton text={identity.programId} />
                    </div>
                </div>

                {/* Activity Status */}
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={identity.isActive ? 'default' : 'secondary'}>
                        {identity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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

                    {/* Activity Window */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            <span>Activity Window</span>
                        </div>
                        <div className="pl-6">
                            <div className="font-mono text-sm">
                                {identity.activityWindowDays} days
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(identity.activityWindowDays / 7).toFixed(1)} weeks
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
