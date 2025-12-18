import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { PNode } from "@/types/pnode";

interface NetworkHealthProps {
    nodes: PNode[];
    className?: string;
}

export function NetworkHealth({ nodes, className }: NetworkHealthProps) {
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const totalNodes = nodes.length;
    const healthPercentage = totalNodes > 0 ? Math.round((onlineNodes / totalNodes) * 100) : 0;

    let status = "Healthy";
    let colorClass = "text-emerald-500";
    let pulseClass = "bg-emerald-500";

    if (healthPercentage < 80) {
        status = "Degraded";
        colorClass = "text-amber-500";
        pulseClass = "bg-amber-500";
    } else if (healthPercentage < 50) {
        status = "Critical";
        colorClass = "text-rose-500";
        pulseClass = "bg-rose-500";
    }

    return (
        <div className={cn("flex items-center gap-3 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 backdrop-blur-sm", className)}>
            <div className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseClass)}></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2", pulseClass)}></span>
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Network Pulse</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("text-xs font-bold", colorClass)}>{status}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{healthPercentage}% Online</span>
                </div>
            </div>
        </div>
    );
}
