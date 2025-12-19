import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UptimeHeatmapProps {
    data?: { date: string; uptime: number }[];
}

export function UptimeHeatmap({ data }: UptimeHeatmapProps) {
    // Generate mock data for the last 30 days if no data provided
    const heatmapData = data || Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            date: date.toISOString().split('T')[0],
            uptime: Math.random() > 0.1 ? 95 + Math.random() * 5 : 0 // 10% chance of downtime
        };
    });

    const getIntensity = (uptime: number) => {
        if (uptime === 0) return 'bg-rose-500/20 border-rose-500/40';
        if (uptime >= 99.9) return 'bg-emerald-500 border-emerald-600';
        if (uptime >= 99) return 'bg-emerald-500/80 border-emerald-500';
        if (uptime >= 95) return 'bg-emerald-500/60 border-emerald-500/80';
        return 'bg-amber-500/60 border-amber-500/80';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reliability Heatmap (30D)</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-rose-500/20" />
                    <div className="w-2 h-2 rounded-sm bg-emerald-500/40" />
                    <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                    <span className="text-[8px] text-muted-foreground uppercase font-bold">Uptime Intensity</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                <TooltipProvider>
                    {heatmapData.map((day, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        "w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 cursor-help",
                                        getIntensity(day.uptime)
                                    )}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-black/90 border-white/10 backdrop-blur-md">
                                <div className="text-[10px] space-y-1">
                                    <div className="font-bold text-white">{day.date}</div>
                                    <div className={cn("font-mono", day.uptime > 0 ? "text-emerald-400" : "text-rose-400")}>
                                        Uptime: {day.uptime.toFixed(2)}%
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>

            <div className="flex justify-between text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">
                <span>30 Days Ago</span>
                <span>Today</span>
            </div>
        </div>
    );
}
