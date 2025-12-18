import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { PNode } from '@/types/pnode';
import { Terminal, Zap, Shield, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GossipEvent {
    id: string;
    type: 'discovery' | 'status_change' | 'sync' | 'storage';
    message: string;
    timestamp: Date;
    nodeId?: string;
}

interface GossipFeedProps {
    nodes: PNode[];
    className?: string;
}

export function GossipFeed({ nodes, className }: GossipFeedProps) {
    const [events, setEvents] = useState<GossipEvent[]>([]);
    const prevNodesRef = useRef<PNode[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial events if we have nodes
        if (prevNodesRef.current.length === 0 && nodes.length > 0) {
            const initialEvents: GossipEvent[] = nodes.slice(0, 8).map(node => ({
                id: Math.random().toString(36).substr(2, 9),
                type: 'discovery',
                message: `BOOTSTRAP: Discovered pNode [${node.id.slice(0, 12)}...] at ${node.ip}`,
                timestamp: new Date(),
                nodeId: node.id
            }));
            setEvents(initialEvents);
            prevNodesRef.current = nodes;
            return;
        }

        // Detect changes
        const newEvents: GossipEvent[] = [];

        nodes.forEach(node => {
            const prevNode = prevNodesRef.current.find(n => n.id === node.id);
            if (!prevNode) {
                newEvents.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'discovery',
                    message: `GOSSIP: New node joined network: ${node.id.slice(0, 12)}...`,
                    timestamp: new Date(),
                    nodeId: node.id
                });
            } else if (prevNode.status !== node.status) {
                newEvents.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'status_change',
                    message: `EVENT: Node ${node.id.slice(0, 12)} status changed to [${node.status.toUpperCase()}]`,
                    timestamp: new Date(),
                    nodeId: node.id
                });
            }
        });

        if (newEvents.length > 0) {
            setEvents(prev => [...prev, ...newEvents].slice(-50));
        }
        prevNodesRef.current = nodes;
    }, [nodes]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events]);

    const getTypeColor = (type: GossipEvent['type']) => {
        switch (type) {
            case 'discovery': return 'text-blue-400';
            case 'status_change': return 'text-amber-400';
            case 'storage': return 'text-emerald-400';
            default: return 'text-primary';
        }
    };

    return (
        <Card className={cn("bg-black/90 border-border/50 font-mono text-[11px] overflow-hidden flex flex-col shadow-2xl h-full", className)}>
            <div className="bg-muted/30 px-3 py-2 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="h-3 w-3 text-emerald-500" />
                    <span className="text-muted-foreground uppercase tracking-tighter font-bold">pRPC Gossip Monitor</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar scroll-smooth"
            >
                {events.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-500/50">
                        <span className="animate-pulse">_</span>
                        <span>Initializing gossip listener...</span>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="flex gap-2 group leading-relaxed">
                            <span className="text-muted-foreground/40 shrink-0">
                                [{event.timestamp.toLocaleTimeString([], { hour12: false })}]
                            </span>
                            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500/50" />
                            <span className={cn("break-all", getTypeColor(event.type))}>
                                {event.message}
                            </span>
                        </div>
                    ))
                )}
                <div className="flex items-center gap-2 text-emerald-500">
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </Card>
    );
}
