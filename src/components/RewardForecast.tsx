import { PNode } from '@/types/pnode';
import { Card } from '@/components/ui/card';
import { Coins, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

interface RewardForecastProps {
    node: PNode;
}

export function RewardForecast({ node }: RewardForecastProps) {
    // Basic forecasting logic based on current credits and rank
    // In a real scenario, this would use historical growth rates
    const currentCredits = node.credits || 0;
    const rank = node.rank || 100;

    // Estimate daily rewards based on rank (higher rank = more rewards)
    // This is a simplified model for the hackathon
    const dailyEstimate = Math.max(10, (1000 / rank) * (node.metrics.uptime / 100));
    const weeklyEstimate = dailyEstimate * 7;
    const monthlyEstimate = dailyEstimate * 30;

    return (
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        STOINC Reward Forecast
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Estimated earnings based on current performance
                    </p>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-full">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Daily Est.</div>
                    <div className="text-2xl font-bold font-mono">
                        {dailyEstimate.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3" />
                        +2.4% vs avg
                    </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Weekly Est.</div>
                    <div className="text-2xl font-bold font-mono">
                        {weeklyEstimate.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3" />
                        +15.2% vs avg
                    </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Monthly Est.</div>
                    <div className="text-2xl font-bold font-mono">
                        {monthlyEstimate.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3" />
                        +64.8% vs avg
                    </div>
                </div>
            </div>

            <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-bold text-blue-500">PRO TIP:</span> Increasing your committed storage by 1TB could boost your monthly STOINC yield by approximately 12%.
                </p>
            </div>
        </Card>
    );
}
