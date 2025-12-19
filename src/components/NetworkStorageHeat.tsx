import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { PNode } from '@/types/pnode';

interface NetworkStorageHeatProps {
    nodes: PNode[];
}

export function NetworkStorageHeat({ nodes }: NetworkStorageHeatProps) {
    const totalCommitted = nodes.reduce((acc, node) => acc + (node.storage?.committed || 0), 0);
    const totalUsed = nodes.reduce((acc, node) => acc + (node.storage?.used || 0), 0);
    const saturation = totalCommitted > 0 ? (totalUsed / totalCommitted) * 100 : 0;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className="border border-border/50 shadow-premium overflow-hidden relative group bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-blue-500/5" />
            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Storage Heat</span>
                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${saturation > 80 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            {saturation > 80 ? 'HIGH' : 'OPTIMAL'}
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <Database className="h-5 w-5 text-blue-500" />
                    </div>
                </div>
                <div>
                    <div className="text-3xl font-bold tracking-tight">{formatBytes(totalCommitted)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Total Capacity • <span className={saturation > 80 ? 'text-rose-400' : 'text-blue-400'}>{saturation.toFixed(2)}% Saturation</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
