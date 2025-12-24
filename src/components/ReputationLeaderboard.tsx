import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { PNode } from '@/types/pnode';
import { reputationService, ReputationScore, ReputationLeaderboard as LeaderboardData } from '@/services/reputation';

interface ReputationLeaderboardProps {
  nodes: PNode[];
}

export function ReputationLeaderboard({ nodes }: ReputationLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (nodes.length === 0) return;

    const generateLeaderboard = () => {
      setIsLoading(true);
      const data = reputationService.generateLeaderboard(nodes);
      setLeaderboard(data);
      setIsLoading(false);
    };

    generateLeaderboard();
  }, [nodes]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return <Star className="h-4 w-4 text-muted-foreground" />;
  };

  const getTierBadge = (reputation: ReputationScore) => {
    const icon = reputationService.getTierIcon(reputation.tier);
    const gradient = reputationService.getTierColor(reputation.tier);
    
    return (
      <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
        {icon} {reputation.tier.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Calculating reputation scores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Total Ranked</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{leaderboard?.totalRanked || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Network Average</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">{leaderboard?.averageScore || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
              <span className="text-xs md:text-sm text-muted-foreground">Top Score</span>
            </div>
            <div className="text-xl md:text-2xl font-bold">
              {leaderboard?.topNodes[0]?.totalScore || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm md:text-base font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 md:h-5 md:w-5" />
            Top Nodes by Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 md:h-[600px]">
            <div className="space-y-3">
              {leaderboard?.topNodes.map((reputation) => {
                const node = nodes.find(n => n.id === reputation.nodeId);
                const credits = node?.credits || 0;
                const ipAddress = node?.ip || 'Unknown';
                
                return (
                <div 
                  key={reputation.nodeId} 
                  className={`p-3 md:p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-all ${
                    reputation.rank <= 3 ? 'border-2 border-yellow-500/50 bg-yellow-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="mt-0.5">{getRankIcon(reputation.rank)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs md:text-sm font-medium">
                              Rank #{reputation.rank}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground truncate">
                              {ipAddress}
                            </span>
                          </div>
                          {getTierBadge(reputation)}
                        </div>
                        
                        {/* Credits Display */}
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs">
                            💰 STOINC Rewards: {credits.toLocaleString()}
                          </Badge>
                        </div>
                        
                        {/* Badges */}
                        {reputation.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {reputation.badges.slice(0, 3).map((badge, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                            {reputation.badges.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{reputation.badges.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl md:text-3xl font-bold">{reputation.totalScore}</div>
                      <div className="text-xs text-muted-foreground">score</div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{reputation.components.uptime}/30</span>
                      </div>
                      <Progress value={(reputation.components.uptime / 30) * 100} className="h-1.5" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-medium">{reputation.components.performance.toFixed(0)}/25</span>
                      </div>
                      <Progress value={(reputation.components.performance / 25) * 100} className="h-1.5" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">Reliability</span>
                        <span className="font-medium">{reputation.components.reliability.toFixed(0)}/25</span>
                      </div>
                      <Progress value={(reputation.components.reliability / 25) * 100} className="h-1.5" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground">Longevity</span>
                        <span className="font-medium">{reputation.components.longevity.toFixed(0)}/20</span>
                      </div>
                      <Progress value={(reputation.components.longevity / 20) * 100} className="h-1.5" />
                    </div>
                  </div>

                  {/* Trust Level */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Trust Level</span>
                    <Badge variant="outline" className={`text-xs ${
                      reputation.trustLevel === 'excellent' ? 'border-green-500 text-green-500' :
                      reputation.trustLevel === 'good' ? 'border-blue-500 text-blue-500' :
                      reputation.trustLevel === 'fair' ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                    }`}>
                      {reputation.trustLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
