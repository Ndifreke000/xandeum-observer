import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
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
import { EmptyState } from '@/components/EmptyState';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { 
  NetworkStatsSkeleton, 
  NetworkInsightsSkeleton, 
  LeaderboardSkeleton,
  NodeGridSkeleton,
  ChartSkeleton 
} from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, RefreshCw, Calculator, TrendingUp, BarChart3 } from 'lucide-react';

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
    refetchInterval: 30000,
    staleTime: 20000,
    gcTime: 300000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
        description: 'Failed to connect to pRPC network. Retrying...',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: 'Refreshing data',
      description: 'Fetching latest network information...',
    });
  }, [refetch, toast]);

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

  const handleHeroSearch = useCallback((query: string) => {
    updateFilter('search', query);
    // Scroll to node registry
    document.getElementById('node-registry')?.scrollIntoView({ behavior: 'smooth' });
  }, [updateFilter]);

  const handleQuickFilter = useCallback((preset: string) => {
    applyPreset(preset);
    // Scroll to node registry
    document.getElementById('node-registry')?.scrollIntoView({ behavior: 'smooth' });
  }, [applyPreset]);

  // Loading state with skeletons
  if (isLoading && nodes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          onRefresh={handleRefresh}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          nodes={nodes}
          onSelectNode={handleSelectNode}
        />
        <main className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6">
          <EmptyState
            icon={<Server className="h-12 w-12 text-muted-foreground" />}
            title="Discovering pNodes..."
            description="Scanning the Xandeum network for storage providers. This may take a few moments."
            isLoading={true}
          />
          <NetworkStatsSkeleton />
          <NetworkInsightsSkeleton />
          <LeaderboardSkeleton />
        </main>
      </div>
    );
  }

  // Empty state for no nodes
  if (!isLoading && nodes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          onRefresh={handleRefresh}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          nodes={nodes}
          onSelectNode={handleSelectNode}
        />
        <main className="flex-1 p-6">
          <EmptyState
            icon={<Server className="h-12 w-12 text-muted-foreground" />}
            title="No pNodes Found"
            description="Unable to discover any pNodes on the network. Please check your connection and try again."
            action={
              <Button onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            }
          />
        </main>
      </div>
    );
  }

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
          {/* HERO SECTION - Clear CTA and Search */}
          <HeroSection 
            nodes={nodes} 
            onSearch={handleHeroSearch}
            onQuickFilter={handleQuickFilter}
          />

          {/* CRITICAL: Network Stats - Always visible */}
          {isLoading ? <NetworkStatsSkeleton /> : <NetworkStats nodes={nodes} />}

          {/* HIGH PRIORITY: Network Insights - Always visible */}
          {isLoading ? <NetworkInsightsSkeleton /> : <NetworkInsights nodes={nodes} />}

          {/* Visual Wow Factor - 3D Globe */}
          <div className="mb-4 md:mb-6">
            <GlobeVisualization nodes={nodes} />
          </div>

          {/* HIGH PRIORITY: Top Performers - Always visible */}
          {isLoading ? <LeaderboardSkeleton /> : <Leaderboard nodes={nodes} onSelectNode={handleSelectNode} />}

          {/* MEDIUM: Collapsible Advanced Sections */}
          <div className="space-y-4">
            {/* 24h Trends - Collapsible */}
            <CollapsibleSection
              title="24-Hour Network Trends"
              description="Real-time performance metrics over the last 24 hours"
              defaultOpen={false}
              badge={<Badge variant="secondary" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" />Live Data</Badge>}
            >
              {isLoading ? <ChartSkeleton /> : <NetworkTrendChart nodes={nodes} />}
            </CollapsibleSection>

            {/* Earnings Calculator - Collapsible */}
            <CollapsibleSection
              title="STOINC Earnings Calculator"
              description="Calculate potential earnings and ROI for running a pNode"
              defaultOpen={false}
              badge={<Badge variant="secondary" className="text-xs"><Calculator className="h-3 w-3 mr-1" />ROI Tool</Badge>}
            >
              <EarningsCalculator nodes={nodes} />
            </CollapsibleSection>

            {/* Historical Charts - Collapsible */}
            <CollapsibleSection
              title="Historical Performance"
              description="Long-term network health and performance trends"
              defaultOpen={false}
              badge={<Badge variant="secondary" className="text-xs"><BarChart3 className="h-3 w-3 mr-1" />Analytics</Badge>}
            >
              {isLoading ? <ChartSkeleton /> : <HistoricalCharts nodes={nodes} />}
            </CollapsibleSection>
          </div>

          {/* Node Registry with Filters */}
          <div id="node-registry" className="border-t-2 border-border/60 pt-6 scroll-mt-20">
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

            {isLoading ? (
              <NodeGridSkeleton />
            ) : (
              <PNodeGrid
                nodes={filteredNodes}
                onSelectNode={handleSelectNode}
                onCompareNode={handleCompareNode}
                selectedNodeId={selectedNode?.id}
              />
            )}
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
