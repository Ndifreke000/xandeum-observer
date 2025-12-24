import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { NetworkStats } from '@/components/NetworkStats';
import { NetworkInsights } from '@/components/NetworkInsights';
import { NetworkTrendChart } from '@/components/NetworkTrendChart';
import { PNodeGrid } from '@/components/PNodeGrid';
import { PNodeDetail } from '@/components/PNodeDetail';
import { prpcService } from '@/services/prpc';
import { PNode } from '@/types/pnode';
import { useToast } from '@/hooks/use-toast';
import { useWeb3Alerts } from '@/hooks/useWeb3Alerts';
import { useNodeFilters } from '@/hooks/useNodeFilters';
import GlobeVisualization from '@/components/GlobeVisualization';
import { HistoricalCharts } from '@/components/HistoricalCharts';
import { Leaderboard } from '@/components/Leaderboard';
import { ComparisonModal } from '@/components/ComparisonModal';
import { NodeFilterPanel } from '@/components/NodeFilterPanel';
import { EarningsCalculator } from '@/components/EarningsCalculator';

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  const [compareNode, setCompareNode] = useState<PNode | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const { toast } = useToast();
  
  // Initialize Web3 alerts monitoring
  useWeb3Alerts();

  const { data: nodes = [], isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['pnodes'],
    queryFn: () => prpcService.getAllPNodes(),
    refetchInterval: 30000, // Optimized: 30 seconds instead of 10
    staleTime: 20000, // Consider data fresh for 20 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (renamed from cacheTime)
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Initialize filter system
  const {
    filters,
    filteredNodes,
    filterOptions,
    updateFilter,
    applyPreset,
    resetFilters,
    hasActiveFilters,
    activePreset,
    presets
  } = useNodeFilters(nodes);

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error fetching pNodes',
        description: 'Failed to connect to pRPC network. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSelectNode = useCallback((node: PNode) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleCompareNode = useCallback((node: PNode) => {
    if (selectedNode && selectedNode.id !== node.id) {
      setCompareNode(node);
      setIsCompareOpen(true);
    } else {
      toast({
        title: 'Select a base node first',
        description: 'Click on a node to view its details, then click "Compare" on another node.',
      });
    }
  }, [selectedNode, toast]);

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
        <div className={`flex-1 p-3 md:p-6 space-y-4 md:space-y-6 transition-all ${selectedNode ? 'lg:mr-[480px]' : ''}`}>
          <NetworkStats nodes={nodes} />

          <NetworkInsights nodes={nodes} />

          <NetworkTrendChart nodes={nodes} />

          <EarningsCalculator nodes={nodes} />

          <HistoricalCharts nodes={nodes} />

          <Leaderboard nodes={nodes} onSelectNode={handleSelectNode} />

          <div className="mb-4 md:mb-6">
            <GlobeVisualization nodes={nodes} />
          </div>

          <div className="border-t-2 border-border/60 pt-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-medium">pNode Registry</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredNodes.length} of {nodes.length} Nodes
                  {hasActiveFilters && ' (filtered)'}
                </span>
              </div>
              <NodeFilterPanel
                filters={filters}
                filterOptions={filterOptions}
                onUpdateFilter={updateFilter}
                onApplyPreset={applyPreset}
                onReset={resetFilters}
                hasActiveFilters={hasActiveFilters}
                activePreset={activePreset}
                presets={presets}
                resultCount={filteredNodes.length}
                totalCount={nodes.length}
              />
            </div>

            <PNodeGrid
              nodes={filteredNodes}
              onSelectNode={handleSelectNode}
              onCompareNode={handleCompareNode}
              selectedNodeId={selectedNode?.id}
            />
          </div>
        </div>

        {selectedNode && (
          <div className="fixed inset-0 lg:inset-auto lg:right-0 lg:top-14 lg:bottom-0 lg:w-[480px] shadow-2xl z-50 bg-background/95 backdrop-blur-sm lg:backdrop-blur-none">
            <PNodeDetail node={selectedNode} onClose={handleCloseDetail} />
          </div>
        )}

        {selectedNode && compareNode && (
          <ComparisonModal
            nodeA={selectedNode}
            nodeB={compareNode}
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
