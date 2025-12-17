import { NodeAnalysis } from '@/types/node-analysis';
import { Card } from '@/components/ui/card';
import { Network, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter } from 'recharts';

interface PeerInteractionProfileProps {
    analysis: NodeAnalysis;
}

export function PeerInteractionProfile({ analysis }: PeerInteractionProfileProps) {
    const { peerProfile } = analysis;

    if (!peerProfile) {
        return (
            <Card className="p-6 flex flex-col h-[400px] items-center justify-center text-muted-foreground">
                <Network className="h-12 w-12 mb-4 opacity-20" />
                <p>Peer interaction data not available for this node.</p>
            </Card>
        );
    }

    const data = peerProfile.temporalMapping.map(point => ({
        time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactions: point.interactionCount,
        peer: point.peerId.substring(0, 8)
    })).slice(-20);

    return (
        <Card className="p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Network className="h-5 w-5 text-indigo-500" />
                        Peer Interaction Profile
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Network topology and peer communication
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">
                        {peerProfile.distinctPeers}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        Distinct Peers
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Left: Top Peers List */}
                <div className="w-1/3 border-r border-border/50 pr-6 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Top Peers</h3>
                    <div className="space-y-3">
                        {peerProfile.topPeers.map((peer, i) => (
                            <div key={peer.peerId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-[10px]">
                                        {i + 1}
                                    </Badge>
                                    <div className="flex flex-col">
                                        <span className="font-mono text-xs">{peer.peerId.substring(0, 8)}...</span>
                                        <span className="text-[10px] text-muted-foreground">{peer.peerIp}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{peer.percentage}%</div>
                                    <div className="text-[10px] text-muted-foreground">{peer.interactionCount} msgs</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Interaction Chart */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Scatter name="Interactions" data={data} fill="hsl(var(--primary))" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                        <div>
                            Load Concentration (Gini): <span className="font-mono text-foreground">{peerProfile.loadConcentration.giniCoefficient.toFixed(3)}</span>
                        </div>
                        <div>
                            Top 3 Peers: <span className="font-mono text-foreground">{peerProfile.loadConcentration.top3Percentage}%</span> of traffic
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
