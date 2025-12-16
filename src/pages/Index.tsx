import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { NetworkStats } from '@/components/NetworkStats';
import { PNodeTable } from '@/components/PNodeTable';
import { PNodeDetail } from '@/components/PNodeDetail';
import { MOCK_PNODES, generateMockPNodes } from '@/lib/mock-data';
import { PNode } from '@/types/pnode';

const Index = () => {
  const [nodes, setNodes] = useState<PNode[]>(MOCK_PNODES);
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    // Simulate RPC refresh
    setTimeout(() => {
      setNodes(generateMockPNodes(50));
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleSelectNode = useCallback((node: PNode) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onRefresh={handleRefresh} isLoading={isLoading} lastUpdated={lastUpdated} />
      
      <main className="flex-1 flex">
        <div className={`flex-1 p-6 space-y-6 transition-all ${selectedNode ? 'mr-[480px]' : ''}`}>
          <div>
            <h1 className="text-xl font-semibold mb-1">Network Overview</h1>
            <p className="text-sm text-muted-foreground">
              Real-time pNode discovery and monitoring via pRPC v0.7.0
            </p>
          </div>
          
          <NetworkStats nodes={nodes} />
          
          <div>
            <h2 className="text-lg font-medium mb-4">pNode Registry</h2>
            <PNodeTable 
              nodes={nodes} 
              onSelectNode={handleSelectNode}
              selectedNodeId={selectedNode?.id}
            />
          </div>
        </div>

        {selectedNode && (
          <div className="fixed right-0 top-14 bottom-0 w-[480px] shadow-lg">
            <PNodeDetail node={selectedNode} onClose={handleCloseDetail} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
