import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Server, Zap, ArrowRight } from 'lucide-react';
import { PNode } from '@/types/pnode';
import { useState } from 'react';

interface HeroSectionProps {
  nodes: PNode[];
  onSearch: (query: string) => void;
  onQuickFilter: (preset: string) => void;
}

export function HeroSection({ nodes, onSearch, onQuickFilter }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const avgHealth = nodes.length > 0
    ? Math.round(nodes.reduce((sum, n) => sum + (n.health?.total || 0), 0) / nodes.length)
    : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      
      <CardContent className="relative p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
              Monitor Your Xandeum pNodes
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Real-time analytics and insights for Xandeum storage provider nodes. 
              Track performance, earnings, and network health.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by node IP, ID, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 text-base border-2 focus-visible:ring-2"
              />
              <Button 
                type="submit"
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground mr-2">Quick filters:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter('top-performers')}
              className="gap-1.5 h-8"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Top Performers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter('online')}
              className="gap-1.5 h-8"
            >
              <Server className="h-3.5 w-3.5" />
              Online Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickFilter('high-capacity')}
              className="gap-1.5 h-8"
            >
              <Zap className="h-3.5 w-3.5" />
              High Capacity
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg border">
              <div className="text-2xl md:text-3xl font-bold text-primary">{nodes.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Nodes</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border">
              <div className="text-2xl md:text-3xl font-bold text-green-500">{onlineNodes}</div>
              <div className="text-xs text-muted-foreground mt-1">Online Now</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border">
              <div className="text-2xl md:text-3xl font-bold text-blue-500">{avgHealth}%</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Health</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg border">
              <div className="text-2xl md:text-3xl font-bold text-purple-500">
                {nodes.reduce((sum, n) => sum + (n.credits || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Credits</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
