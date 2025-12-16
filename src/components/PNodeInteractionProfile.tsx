import { PNodeInteractionProfile as PNodeInteractionProfileType } from '@/types/contract';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/contract-utils';
import { Network, AlertCircle, Server } from 'lucide-react';

interface PNodeInteractionProfileProps {
    profile: PNodeInteractionProfileType;
}

export function PNodeInteractionProfile({ profile }: PNodeInteractionProfileProps) {
    // Determine concentration level
    const getConcentrationLevel = (gini: number) => {
        if (gini > 0.7) return { label: 'Very High', color: 'text-[hsl(var(--status-offline))]' };
        if (gini > 0.5) return { label: 'High', color: 'text-[hsl(var(--status-unstable))]' };
        if (gini > 0.3) return { label: 'Moderate', color: 'text-[hsl(var(--chart-1))]' };
        return { label: 'Low (Well Distributed)', color: 'text-[hsl(var(--status-online))]' };
    };

    const concentrationLevel = getConcentrationLevel(profile.loadConcentration.giniCoefficient);

    return (
        <Card className="p-6">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h2 className="text-lg font-semibold mb-1">pNode Interaction Profile</h2>
                    <p className="text-sm text-muted-foreground">
                        Distribution of contract calls across network nodes
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Distinct Nodes */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Server className="h-4 w-4" />
                            <span>Distinct pNodes</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {profile.distinctPNodesUsed}
                            </div>
                            <div className="text-xs text-muted-foreground">nodes utilized</div>
                        </div>
                    </div>

                    {/* Load Concentration */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Network className="h-4 w-4" />
                            <span>Load Concentration</span>
                        </div>
                        <div className="pl-6">
                            <div className={`text-lg font-semibold ${concentrationLevel.color}`}>
                                {concentrationLevel.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Gini: {profile.loadConcentration.giniCoefficient.toFixed(3)}
                            </div>
                        </div>
                    </div>

                    {/* Top 3 Share */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>Top 3 Nodes</span>
                        </div>
                        <div className="pl-6">
                            <div className="text-2xl font-mono font-semibold">
                                {profile.loadConcentration.top3Percentage.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">of total calls</div>
                        </div>
                    </div>
                </div>

                {/* Top Nodes Table */}
                <div className="pt-2">
                    <h3 className="text-sm font-medium mb-3">Top pNodes by Call Volume</h3>
                    <div className="border border-border rounded-md overflow-hidden">
                        <table className="w-full table-dense">
                            <thead>
                                <tr className="bg-surface-subtle">
                                    <th className="text-left">Rank</th>
                                    <th className="text-left">Node ID</th>
                                    <th className="text-left">IP Address</th>
                                    <th className="text-right">Calls</th>
                                    <th className="text-right">Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profile.topNodes.map((node, idx) => (
                                    <tr key={node.nodeId}>
                                        <td>
                                            <Badge variant={idx < 3 ? 'default' : 'secondary'}>
                                                #{idx + 1}
                                            </Badge>
                                        </td>
                                        <td className="font-mono text-xs">{node.nodeId}</td>
                                        <td className="font-mono text-xs">{node.nodeIp}</td>
                                        <td className="text-right font-mono">
                                            {formatNumber(node.callCount)}
                                        </td>
                                        <td className="text-right font-mono">
                                            {node.percentage.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inline Explanation */}
                <div className="text-xs text-muted-foreground bg-surface-subtle p-3 rounded">
                    <strong>About Load Concentration:</strong> The Gini coefficient measures inequality
                    in load distribution (0 = perfectly distributed, 1 = completely concentrated). High
                    concentration may indicate potential bottlenecks or reliance on specific nodes.
                    Top 3 share shows how much of the total load is handled by the busiest three nodes.
                </div>
            </div>
        </Card>
    );
}
