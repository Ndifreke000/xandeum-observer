import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Network,
  Shield
} from 'lucide-react';
import { PNode } from '@/types/pnode';

interface SimulationNode {
  id: string;
  x: number;
  y: number;
  status: 'active' | 'proposing' | 'voting' | 'failed' | 'recovering';
  votes: number;
  isLeader: boolean;
  lastSeen: number;
  connections: string[];
}

interface ConsensusRound {
  round: number;
  leader: string;
  proposal: string;
  votes: Map<string, boolean>;
  status: 'proposing' | 'voting' | 'committed' | 'failed';
  timestamp: number;
}

interface ConsensusSimulatorProps {
  nodes: PNode[];
}

export function ConsensusSimulator({ nodes }: ConsensusSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [failureRate, setFailureRate] = useState(0);
  const [showConnections, setShowConnections] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [consensusHistory, setConsensusHistory] = useState<ConsensusRound[]>([]);
  const [simulationNodes, setSimulationNodes] = useState<SimulationNode[]>([]);

  // Initialize simulation nodes from real pNodes
  useEffect(() => {
    if (nodes.length === 0) return;

    const simNodes: SimulationNode[] = nodes.slice(0, 12).map((node, index) => {
      const angle = (index / Math.min(nodes.length, 12)) * 2 * Math.PI;
      const radius = 120;
      return {
        id: node.id.substring(0, 8),
        x: 150 + radius * Math.cos(angle),
        y: 150 + radius * Math.sin(angle),
        status: node.status === 'online' ? 'active' : 'failed',
        votes: 0,
        isLeader: index === 0,
        lastSeen: Date.now(),
        connections: []
      };
    });

    // Create mesh network connections
    simNodes.forEach((node, i) => {
      const connections: string[] = [];
      // Connect to 3-4 neighbors
      for (let j = 1; j <= 3; j++) {
        const neighborIndex = (i + j) % simNodes.length;
        connections.push(simNodes[neighborIndex].id);
      }
      node.connections = connections;
    });

    setSimulationNodes(simNodes);
  }, [nodes]);

  // Consensus simulation logic
  const runConsensusRound = useCallback(() => {
    setSimulationNodes(prev => {
      const newNodes = [...prev];
      
      // Simulate random failures based on failure rate
      if (failureRate > 0 && Math.random() < failureRate / 100) {
        const randomIndex = Math.floor(Math.random() * newNodes.length);
        if (newNodes[randomIndex].status !== 'failed') {
          newNodes[randomIndex].status = 'failed';
          newNodes[randomIndex].lastSeen = Date.now();
        }
      }

      // Recover failed nodes (Byzantine fault tolerance)
      newNodes.forEach(node => {
        if (node.status === 'failed' && Date.now() - node.lastSeen > 3000) {
          node.status = 'recovering';
          setTimeout(() => {
            setSimulationNodes(n => n.map(nd => 
              nd.id === node.id ? { ...nd, status: 'active' } : nd
            ));
          }, 1000);
        }
      });

      // Leader election (Raft-like)
      const activeNodes = newNodes.filter(n => n.status === 'active' || n.status === 'proposing');
      if (activeNodes.length > 0) {
        const currentLeader = newNodes.find(n => n.isLeader);
        if (!currentLeader || currentLeader.status === 'failed') {
          // Elect new leader
          newNodes.forEach(n => n.isLeader = false);
          const newLeader = activeNodes[Math.floor(Math.random() * activeNodes.length)];
          newLeader.isLeader = true;
          newLeader.status = 'proposing';
        }

        // Consensus voting
        const leader = newNodes.find(n => n.isLeader);
        if (leader && leader.status === 'proposing') {
          // Voting phase
          activeNodes.forEach(node => {
            if (node.id !== leader.id) {
              node.status = 'voting';
              node.votes = Math.random() > 0.1 ? 1 : 0; // 90% vote yes
            }
          });

          // Count votes
          const totalVotes = activeNodes.reduce((sum, n) => sum + n.votes, 0);
          const quorum = Math.ceil(activeNodes.length * 0.67); // 2/3 majority

          if (totalVotes >= quorum) {
            // Consensus reached
            leader.status = 'active';
            activeNodes.forEach(n => n.status = 'active');
            
            setConsensusHistory(prev => [...prev, {
              round: currentRound + 1,
              leader: leader.id,
              proposal: `Block ${currentRound + 1}`,
              votes: new Map(activeNodes.map(n => [n.id, n.votes === 1])),
              status: 'committed' as const,
              timestamp: Date.now()
            }].slice(-10)); // Keep last 10 rounds
            
            setCurrentRound(r => r + 1);
          }
        }
      }

      return newNodes;
    });
  }, [currentRound, failureRate]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning || simulationNodes.length === 0) return;

    const interval = setInterval(() => {
      runConsensusRound();
    }, 2000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, runConsensusRound, simulationNodes.length]);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentRound(0);
    setConsensusHistory([]);
    setSimulationNodes(prev => prev.map(node => ({
      ...node,
      status: 'active',
      votes: 0,
      isLeader: node.id === prev[0]?.id
    })));
  };

  const getNodeColor = (status: SimulationNode['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'proposing': return '#3b82f6';
      case 'voting': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'recovering': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: SimulationNode['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'proposing': return <Zap className="h-3 w-3" />;
      case 'voting': return <Activity className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      case 'recovering': return <Shield className="h-3 w-3" />;
      default: return <Network className="h-3 w-3" />;
    }
  };

  const stats = useMemo(() => {
    const active = simulationNodes.filter(n => n.status === 'active').length;
    const failed = simulationNodes.filter(n => n.status === 'failed').length;
    const successRate = consensusHistory.length > 0 
      ? (consensusHistory.filter(r => r.status === 'committed').length / consensusHistory.length) * 100 
      : 0;
    
    return { active, failed, successRate, total: simulationNodes.length };
  }, [simulationNodes, consensusHistory]);

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Live Consensus Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for network data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Live Consensus Simulator
            <Badge variant="outline" className="ml-2">
              Byzantine Fault Tolerant
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-muted/50 rounded-lg p-2 md:p-3">
            <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Round</div>
            <div className="text-xl md:text-2xl font-bold">{currentRound}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 md:p-3">
            <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Active Nodes</div>
            <div className="text-xl md:text-2xl font-bold text-green-500">{stats.active}/{stats.total}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 md:p-3">
            <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Failed Nodes</div>
            <div className="text-xl md:text-2xl font-bold text-red-500">{stats.failed}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 md:p-3">
            <div className="text-[10px] md:text-xs text-muted-foreground mb-1">Success Rate</div>
            <div className="text-xl md:text-2xl font-bold text-blue-500">{stats.successRate.toFixed(0)}%</div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <Label className="text-[10px] md:text-xs">Simulation Speed: {simulationSpeed}x</Label>
            <Slider
              value={[simulationSpeed]}
              onValueChange={([value]) => setSimulationSpeed(value)}
              min={0.5}
              max={3}
              step={0.5}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] md:text-xs">Failure Rate: {failureRate}%</Label>
            <Slider
              value={[failureRate]}
              onValueChange={([value]) => setFailureRate(value)}
              min={0}
              max={30}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="connections" className="text-[10px] md:text-xs">Show Connections</Label>
            <Switch
              id="connections"
              checked={showConnections}
              onCheckedChange={setShowConnections}
            />
          </div>
        </div>

        {/* Visualization */}
        <div className="relative bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden" style={{ height: '250px', minHeight: '250px' }}>
          <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
            {/* Connections */}
            {showConnections && simulationNodes.map(node => 
              node.connections.map(connId => {
                const targetNode = simulationNodes.find(n => n.id === connId);
                if (!targetNode || node.status === 'failed' || targetNode.status === 'failed') return null;
                
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.2"
                    className="text-muted-foreground"
                  />
                );
              })
            )}

            {/* Nodes */}
            {simulationNodes.map(node => (
              <g key={node.id}>
                {/* Leader ring */}
                {node.isLeader && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="18"
                    fill="none"
                    stroke={getNodeColor(node.status)}
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="18"
                      to="24"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  fill={getNodeColor(node.status)}
                  stroke="white"
                  strokeWidth="2"
                  opacity={node.status === 'failed' ? 0.3 : 1}
                />

                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 25}
                  textAnchor="middle"
                  className="text-[8px] fill-current"
                  opacity="0.7"
                >
                  {node.id}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-1.5 md:p-2 text-[10px] md:text-xs space-y-0.5 md:space-y-1">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 flex-shrink-0" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500 flex-shrink-0" />
              <span>Proposing</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 flex-shrink-0" />
              <span>Voting</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 flex-shrink-0" />
              <span>Failed</span>
            </div>
          </div>
        </div>

        {/* Recent Consensus Rounds */}
        <div className="space-y-2">
          <h4 className="text-xs md:text-sm font-medium">Recent Consensus Rounds</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {consensusHistory.slice().reverse().map((round, index) => (
              <div
                key={round.round}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-muted/30 rounded text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] md:text-xs">
                    Round {round.round}
                  </Badge>
                  <span className="text-muted-foreground text-[10px] md:text-xs truncate">
                    Leader: {round.leader}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px] md:text-xs">
                    {round.votes.size} votes
                  </span>
                  {round.status === 'committed' ? (
                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
            {consensusHistory.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-[10px] md:text-xs">
                No consensus rounds yet. Click Start to begin simulation.
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 md:p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-[10px] md:text-xs space-y-1">
              <p className="font-medium text-blue-500">How it works:</p>
              <p className="text-muted-foreground">
                This simulator demonstrates Byzantine Fault Tolerant consensus similar to Xandeum's protocol. 
                Nodes elect a leader, propose blocks, vote, and reach consensus with 2/3 majority. 
                Failed nodes are automatically detected and recovered, ensuring network resilience.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
