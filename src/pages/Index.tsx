import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NetworkStats } from '@/components/NetworkStats';
import { PNodeGrid } from '@/components/PNodeGrid';
import { PNodeDetail } from '@/components/PNodeDetail';
import { prpcService } from '@/services/prpc';
import { PNode } from '@/types/pnode';
import { useToast } from '@/hooks/use-toast';
import GlobeVisualization from '@/components/GlobeVisualization';
import { HistoricalCharts } from '@/components/HistoricalCharts';
import { Leaderboard } from '@/components/Leaderboard';
import { GossipFeed } from '@/components/GossipFeed';

const Index = () => {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchPNodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedNodes = await prpcService.getAllPNodes();
      setNodes(fetchedNodes);
      setLastUpdated(new Date());

      if (fetchedNodes.length === 0) {
        toast({
          title: 'No nodes found',
          description: 'Unable to discover any pNodes from seed IPs.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch pNodes:', error);
      toast({
        title: 'Error fetching pNodes',
        description: 'Failed to connect to pRPC network. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial fetch on mount and interval
  useEffect(() => {
    fetchPNodes();
    const interval = setInterval(fetchPNodes, 10000); // 10 seconds refresh
    return () => clearInterval(interval);
  }, [fetchPNodes]);

  const handleRefresh = useCallback(() => {
    fetchPNodes();
  }, [fetchPNodes]);

  const handleSelectNode = useCallback((node: PNode) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onRefresh={handleRefresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        nodes={nodes}
        onSelectNode={handleSelectNode}
      />

      <main className="flex-1 flex relative">
        <div className={`flex-1 p-6 space-y-6 transition-all ${selectedNode ? 'lg:mr-[480px]' : ''}`}>
          <NetworkStats nodes={nodes} />

          <HistoricalCharts nodes={nodes} />

          <Leaderboard nodes={nodes} onSelectNode={handleSelectNode} />

          <div className="mb-6">
            <GlobeVisualization nodes={nodes} />

            <div className="border-t-2 border-border/60 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">pNode Registry</h2>
                <span className="text-sm text-muted-foreground">{nodes.length} Nodes Discovered</span>
              </div>

              <PNodeGrid
                nodes={nodes}
                onSelectNode={handleSelectNode}
                selectedNodeId={selectedNode?.id}
              />
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="fixed inset-0 lg:inset-auto lg:right-0 lg:top-14 lg:bottom-0 lg:w-[480px] shadow-2xl z-50 bg-background/95 backdrop-blur-sm lg:backdrop-blur-none">
            <PNodeDetail node={selectedNode} onClose={handleCloseDetail} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
