import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { SLAVerificationPanel } from '@/components/SLAVerificationPanel';
import { Web3AlertsPanel } from '@/components/Web3AlertsPanel';
import { RewardOptimizationPanel } from '@/components/RewardOptimizationPanel';
import { prpcService } from '@/services/prpc';
import { slaVerificationService } from '@/services/sla-verification';
import { ArrowLeft, Shield, Bell, Brain, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
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

  const { data: nodes = [], isLoading } = useQuery({
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

      <div className="w-full px-6 py-4 pb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <main className="flex-1 w-full px-6 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Features</h1>
          <p className="text-muted-foreground">
            Next-generation monitoring with on-chain verification, Web3 alerts, and AI-driven optimization
          </p>
        </div>

        {/* Network Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{nodes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Nodes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {networkSLACompliance?.compliantNodes || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">SLA Compliant</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {networkSLACompliance?.warningNodes || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {networkSLACompliance?.overallCompliance?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Network Health</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sla" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sla" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              SLA Verification
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Web3 Alerts
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sla" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Network SLA Compliance</h2>
                <Badge variant="outline">
                  On-Chain Verification
                </Badge>
              </div>
              
              {networkSLACompliance && (
                <Card>
                  <CardHeader>
                    <CardTitle>Network-Wide SLA Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {networkSLACompliance.compliantNodes}
                        </div>
                        <div className="text-sm text-muted-foreground">Compliant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {networkSLACompliance.warningNodes}
                        </div>
                        <div className="text-sm text-muted-foreground">Warning</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {networkSLACompliance.violatingNodes}
                        </div>
                        <div className="text-sm text-muted-foreground">Violations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {networkSLACompliance.overallCompliance.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Overall</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Select a specific node from the Node Inspector to view detailed SLA verification
                </p>
                <Button onClick={() => navigate('/nodes/inspector')}>
                  Open Node Inspector
                </Button>
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">AI-Driven Optimization</h2>
                <Badge variant="outline">
                  Machine Learning
                </Badge>
              </div>
              
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  AI optimization is available per-node in the Node Inspector
                </p>
                <Button onClick={() => navigate('/nodes/inspector')}>
                  Open Node Inspector
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}