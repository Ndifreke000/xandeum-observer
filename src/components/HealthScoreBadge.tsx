import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { HealthScoreBreakdown, getScoreColor, getScoreBgColor } from '@/services/health-score';
import { Progress } from '@/components/ui/progress';

interface HealthScoreBadgeProps {
  score: HealthScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export function HealthScoreBadge({ score, size = 'md', showBreakdown = false }: HealthScoreBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const TrendIcon = score.trend === 'up' ? TrendingUp : score.trend === 'down' ? TrendingDown : Minus;
  const trendColor = score.trend === 'up' ? 'text-green-500' : score.trend === 'down' ? 'text-red-500' : 'text-gray-500';

  const badge = (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} ${getScoreBgColor(score.overall)} font-mono font-bold gap-1.5 border`}
    >
      <span className={getScoreColor(score.overall)}>{score.overall}</span>
      <span className="text-muted-foreground text-[10px]">{score.grade}</span>
      <TrendIcon className={`h-3 w-3 ${trendColor}`} />
    </Badge>
  );

  if (!showBreakdown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="w-64">
            <div className="space-y-2">
              <div className="font-semibold text-sm">Health Score Breakdown</div>
              <div className="space-y-1.5 text-xs">
                <ScoreRow label="Uptime" score={score.components.uptime.score} weight={score.components.uptime.weight} />
                <ScoreRow label="Health" score={score.components.health.score} weight={score.components.health.weight} />
                <ScoreRow label="Storage" score={score.components.storage.score} weight={score.components.storage.weight} />
                <ScoreRow label="Latency" score={score.components.latency.score} weight={score.components.latency.weight} />
                <ScoreRow label="Contribution" score={score.components.contribution.score} weight={score.components.contribution.weight} />
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="border-2">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Health Score</div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}
              </span>
              <Badge variant="outline" className="text-lg font-bold">
                {score.grade}
              </Badge>
              <TrendIcon className={`h-5 w-5 ${trendColor}`} />
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Composite score based on uptime (30%), health (25%), storage (20%), latency (15%), and network contribution (10%)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">Component Scores</div>
          <DetailedScoreRow
            label="Uptime"
            score={score.components.uptime.score}
            weight={score.components.uptime.weight}
            value={`${score.components.uptime.value.toFixed(1)}%`}
          />
          <DetailedScoreRow
            label="Health"
            score={score.components.health.score}
            weight={score.components.health.weight}
            value={`${score.components.health.value.toFixed(0)}/100`}
          />
          <DetailedScoreRow
            label="Storage"
            score={score.components.storage.score}
            weight={score.components.storage.weight}
            value={`${score.components.storage.value.toFixed(1)}% util`}
          />
          <DetailedScoreRow
            label="Latency"
            score={score.components.latency.score}
            weight={score.components.latency.weight}
            value={`${score.components.latency.value.toFixed(0)}ms`}
          />
          <DetailedScoreRow
            label="Contribution"
            score={score.components.contribution.score}
            weight={score.components.contribution.weight}
            value={`${score.components.contribution.value} credits`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreRow({ label, score, weight }: { label: string; score: number; weight: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">
        {label} <span className="text-[10px]">({(weight * 100).toFixed(0)}%)</span>
      </span>
      <span className={`font-mono font-semibold ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

function DetailedScoreRow({ label, score, weight, value }: { label: string; score: number; weight: number; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">
          {label} <span className="text-muted-foreground">({(weight * 100).toFixed(0)}%)</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{value}</span>
          <span className={`font-mono font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  );
}
