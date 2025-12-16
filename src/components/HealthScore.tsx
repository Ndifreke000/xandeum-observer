import { PNodeHealthScore } from '@/types/pnode';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthScoreProps {
  health: PNodeHealthScore;
  showBreakdown?: boolean;
}

export function HealthScore({ health, showBreakdown = false }: HealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-status-online';
    if (score >= 50) return 'text-status-unstable';
    return 'text-status-offline';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-status-online';
    if (score >= 50) return 'bg-status-unstable';
    return 'bg-status-offline';
  };

  if (showBreakdown) {
    return (
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-mono font-semibold ${getScoreColor(health.total)}`}>
            {health.total}
          </span>
          <span className="text-muted-foreground text-sm">/100</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Availability (40%)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(health.availability)} transition-all`}
                  style={{ width: `${health.availability}%` }}
                />
              </div>
              <span className="font-mono w-8 text-right">{health.availability}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Stability (35%)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(health.stability)} transition-all`}
                  style={{ width: `${health.stability}%` }}
                />
              </div>
              <span className="font-mono w-8 text-right">{health.stability}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Responsiveness (25%)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(health.responsiveness)} transition-all`}
                  style={{ width: `${health.responsiveness}%` }}
                />
              </div>
              <span className="font-mono w-8 text-right">{health.responsiveness}</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Score = (Availability × 0.4) + (Stability × 0.35) + (Responsiveness × 0.25)
        </p>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className={`font-mono font-medium ${getScoreColor(health.total)}`}>
          {health.total}
        </span>
      </TooltipTrigger>
      <TooltipContent side="left" className="p-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span>Availability</span>
            <span className="font-mono">{health.availability}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Stability</span>
            <span className="font-mono">{health.stability}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Responsiveness</span>
            <span className="font-mono">{health.responsiveness}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
