import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Web3AlertsPanel } from '@/components/Web3AlertsPanel';
import { ConsensusSimulator } from '@/components/ConsensusSimulator';
import { NetworkSLAPanel } from '@/components/NetworkSLAPanel';
import { NetworkOptimizationPanel } from '@/components/NetworkOptimizationPanel';
import { prpcService } from '@/services/prpc';
import { slaVerificationService } from '@/services/sla-verification';
import { ArrowLeft, Shield, Bell, Brain, TrendingUp, CheckCircle, AlertTriangle, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdvancedFeatures() {
  const navigate = useNavigate();
  const [networkSLACompliance, setNetworkSLACompliance] = useState<{ 
    overallCompliance: number; 
    totalNodes: number; 
    compliantNodes: number;
    warningNodes: number;
    violatingNodes: number;
  } | null>(null);

  const { data: nodes = [] } = useQuery({
    queryKey: ['pnodes-advanced'],
    queryFn: () => prpcService.getAllPNodes(),
    refetchInterval: 30000,
  });

  const loadNetworkSLACompliance = useCallback(async () => {
    try {
      const compliance = await slaVerificationService.getNetworkSLACompliance(nodes);
      setNetworkSLACompliance(compliance);
    } catch (error) {
      console.error('Failed to load network SLA compliance:', error);
    }
  }, [nodes]);

  useEffect(() => {
    if (nodes.length > 0) {
      loadNetworkSLACompliance();
    }
  }, [nodes, loadNetworkSLACompliance]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        nodes={nodes}
        onSelectNode={() => {}}
      />

      <div className="w-full px-3 md:px-6 py-4 pb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <main className="flex-1 w-full px-3 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Advanced Features</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Next-generation monitoring with on-chain verification, Web3 alerts, and AI-driven optimization
          </p>
        </div>

        {/* Network Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <div>
                  <div className="text-xl md:text-2xl font-bold">{nodes.length}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Total Nodes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                <div>
                  <div className="text-xl md:text-2xl font-bold">
                    {networkSLACompliance?.compliantNodes || 0}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">SLA Compliant</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <div>
                  <div className="text-xl md:text-2xl font-bold">
                    {networkSLACompliance?.warningNodes || 0}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                <div>
                  <div className="text-xl md:text-2xl font-bold">
                    {networkSLACompliance?.overallCompliance?.toFixed(1) || 0}%
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Network Health</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="consensus" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
            <TabsTrigger value="consensus" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Network className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Consensus Simulator</span>
              <span className="sm:hidden">Consensus</span>
            </TabsTrigger>
            <TabsTrigger value="sla" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Shield className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">SLA Verification</span>
              <span className="sm:hidden">SLA</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Bell className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Web3 Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Brain className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">AI Optimization</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consensus" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Live Consensus Simulator</h2>
                <Badge variant="outline">
                  Byzantine Fault Tolerant
                </Badge>
              </div>
              
              <ConsensusSimulator nodes={nodes} />
            </div>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <NetworkSLAPanel nodes={nodes} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Web3 Alert System</h2>
                <Badge variant="outline">
                  XMTP + Telegram
                </Badge>
              </div>
              
              <Web3AlertsPanel />
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <NetworkOptimizationPanel nodes={nodes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}