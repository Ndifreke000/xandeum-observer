import { PNode } from '@/types/pnode';
import { Card } from '@/components/ui/card';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SLAReportCardProps {
    node: PNode;
}

export function SLAReportCard({ node }: SLAReportCardProps) {
    const uptime = node.metrics.uptime;
    const latency = node.metrics.latency;

    // SLA Thresholds
    const isUptimeCompliant = uptime >= 99.9;
    const isLatencyCompliant = latency <= 200;

    const complianceScore = (isUptimeCompliant ? 50 : (uptime / 100) * 50) + (isLatencyCompliant ? 50 : Math.max(0, 50 - (latency / 20)));

    return (
        <Card className="p-6 border-border/50 shadow-lg bg-card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        SLA Compliance Report
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Verification against network reliability guarantees
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${complianceScore > 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {complianceScore > 90 ? 'ELITE' : 'STANDARD'}
                </div>
            </div>

            <div className="space-y-6">
                {/* Uptime Compliance */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Uptime Consistency (Target: 99.9%)</span>
                        </div>
                        <span className={`font-mono font-bold ${isUptimeCompliant ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {uptime.toFixed(2)}%
                        </span>
                    </div>
                    <Progress value={uptime} className="h-1.5" />
                </div>

                {/* Latency Compliance */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>Latency SLA (Target: &lt;200ms)</span>
                        </div>
                        <span className={`font-mono font-bold ${isLatencyCompliant ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {latency}ms
                        </span>
                    </div>
                    <Progress value={Math.max(0, 100 - (latency / 5))} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-start gap-2">
                        {isUptimeCompliant ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                        )}
                        <div>
                            <div className="text-xs font-bold">Uptime SLA</div>
                            <div className="text-[10px] text-muted-foreground">
                                {isUptimeCompliant ? 'Fully Compliant' : 'Below Target'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        {isLatencyCompliant ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5" />
                        )}
                        <div>
                            <div className="text-xs font-bold">Latency SLA</div>
                            <div className="text-[10px] text-muted-foreground">
                                {isLatencyCompliant ? 'Fully Compliant' : 'Non-Compliant'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
