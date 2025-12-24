import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnomalyDetectionDashboard } from '@/components/AnomalyDetectionDashboard';
import { ReputationLeaderboard } from '@/components/ReputationLeaderboard';
import { PredictiveMaintenanceDashboard } from '@/components/PredictiveMaintenanceDashboard';
import { prpcService } from '@/services/prpc';
import { ArrowLeft, Activity, Trophy, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Intelligence() {
  const navigate = useNavigate();

  const { data: nodes = [] } = useQuery({
    queryKey: ['pnodes-intelligence'],
    queryFn: () => prpcService.getAllPNodes(),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header nodes={nodes} onSelectNode={() => {}} />

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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Network Intelligence</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            AI-powered anomaly detection, reputation scoring, and predictive maintenance
          </p>
        </div>

        <Tabs defaultValue="anomalies" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1">
            <TabsTrigger value="anomalies" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Activity className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Anomaly Detection</span>
              <span className="sm:hidden">Anomalies</span>
            </TabsTrigger>
            <TabsTrigger value="reputation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Trophy className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Reputation System</span>
              <span className="sm:hidden">Reputation</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Wrench className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Predictive Maintenance</span>
              <span className="sm:hidden">Maintenance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies" className="space-y-4">
            <AnomalyDetectionDashboard nodes={nodes} />
          </TabsContent>

          <TabsContent value="reputation" className="space-y-4">
            <ReputationLeaderboard nodes={nodes} />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4">
            <PredictiveMaintenanceDashboard nodes={nodes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
