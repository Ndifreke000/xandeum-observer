import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNodeAnalysis } from '@/hooks/useNodeAnalysis';
import { NodeIdentity } from '@/components/NodeIdentity';
import { StorageAnalysis } from '@/components/StorageAnalysis';
import { NodePerformanceSignals } from '@/components/NodePerformanceSignals';
import { SLAVerificationPanel } from '@/components/SLAVerificationPanel';
import { Web3AlertsPanel } from '@/components/Web3AlertsPanel';
import { RewardOptimizationPanel } from '@/components/RewardOptimizationPanel';
import { EmptyState } from '@/components/EmptyState';
import { Search, RefreshCw, Clock, ArrowLeft, Check, ChevronsUpDown, FileCode, Zap, Activity, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { prpcService } from '@/services/prpc';
import { PNode } from '@/types/pnode';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function BlockNodeEDA() {
    const navigate = useNavigate();
    const [nodeId, setNodeId] = useState('');
    const [searchId, setSearchId] = useState('');
    const [refreshInterval, setRefreshInterval] = useState('30000');
    const [nodes, setNodes] = useState<PNode[]>([]);
    const [open, setOpen] = useState(false);

    // Fetch nodes for dropdown
    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const fetchedNodes = await prpcService.getAllPNodes();
                setNodes(fetchedNodes);
            } catch (error) {
                console.error("Failed to fetch nodes for dropdown", error);
            }
        };
        fetchNodes();
    }, []);

    const {
        analysis,
        isLoading,
        error,
        fetchAnalysis,
        setAutoRefresh,
        setRefreshInterval: updateRefreshInterval,
        lastUpdated,
    } = useNodeAnalysis();

    const [autoRefreshEnabled, setAutoRefreshEnabledState] = useState(false);

    const handleSearch = () => {
        if (nodeId.trim()) {
            setSearchId(nodeId.trim());
            fetchAnalysis(nodeId.trim());
        }
    };

    const handleAutoRefreshToggle = (enabled: boolean) => {
        setAutoRefreshEnabledState(enabled);
        setAutoRefresh(enabled);
    };

    const handleRefreshIntervalChange = (value: string) => {
        setRefreshInterval(value);
        updateRefreshInterval(parseInt(value));
    };

    const handleRefresh = () => {
        if (searchId) {
            fetchAnalysis(searchId);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header
                nodes={nodes}
                onSelectNode={(node) => {
                    setNodeId(node.id);
                    setSearchId(node.id);
                    fetchAnalysis(node.id);
                }}
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
                {/* Hero Section */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <div className="p-4 md:p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-6 w-6 text-primary" />
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Node Inspector</h1>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className="text-xs">Deep dive into individual node performance with real-time metrics, storage analysis, and SLA verification</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-sm md:text-base text-muted-foreground">
                                    Real-time deep dive into individual node performance, storage, and compliance
                                </p>
                            </div>
                            <Badge variant="secondary" className="gap-1.5">
                                <Activity className="h-3 w-3" />
                                {nodes.length} Nodes
                            </Badge>
                        </div>

                        {/* Search Controls */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1 flex gap-2">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between h-11"
                                        >
                                            {nodeId
                                                ? nodes.find((node) => node.id === nodeId)?.ip || nodeId.slice(0, 20) + '...'
                                                : "Select node to inspect..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search by IP or ID..." />
                                            <CommandList>
                                                <CommandEmpty>No node found.</CommandEmpty>
                                                <CommandGroup>
                                                    {nodes.map((node) => (
                                                        <CommandItem
                                                            key={node.id}
                                                            value={node.id}
                                                            onSelect={(currentValue) => {
                                                                setNodeId(currentValue === nodeId ? "" : currentValue)
                                                                setOpen(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    nodeId === node.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{node.ip}</span>
                                                                <span className="text-xs text-muted-foreground">{node.id.slice(0, 30)}...</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <Button onClick={handleSearch} disabled={isLoading || !nodeId} className="gap-2 h-11">
                                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    <span className="hidden sm:inline">Analyze</span>
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 bg-background/50 rounded-lg px-3 py-2 border">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="auto-refresh"
                                        checked={autoRefreshEnabled}
                                        onCheckedChange={handleAutoRefreshToggle}
                                    />
                                    <Label htmlFor="auto-refresh" className="text-xs whitespace-nowrap cursor-pointer">Auto-refresh</Label>
                                </div>

                                <Select
                                    value={refreshInterval}
                                    onValueChange={handleRefreshIntervalChange}
                                    disabled={!autoRefreshEnabled}
                                >
                                    <SelectTrigger className="w-[80px] h-8">
                                        <SelectValue placeholder="Interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10000">10s</SelectItem>
                                        <SelectItem value="30000">30s</SelectItem>
                                        <SelectItem value="60000">1m</SelectItem>
                                        <SelectItem value="300000">5m</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>

                {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                        <div className="flex flex-col gap-3">
                            <AlertDescription className="font-medium">{error}</AlertDescription>
                            {error.includes("not found") && (
                                <div className="flex flex-col gap-2 p-3 bg-background/50 rounded-md border border-destructive/10">
                                    <p className="text-sm text-muted-foreground">
                                        Node not found in the network. Please verify the Node ID or try selecting from the dropdown.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Alert>
                )}

                {/* Analysis Content */}
                {analysis && !error && (
                    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <NodeIdentity analysis={analysis} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <NodePerformanceSignals analysis={analysis} />
                            {analysis.storage && (
                                <StorageAnalysis analysis={analysis} storage={analysis.storage} />
                            )}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                            <SLAVerificationPanel node={nodes.find(n => n.id === searchId) || nodes[0]} />
                            <Web3AlertsPanel />
                        </div>

                        <RewardOptimizationPanel 
                            node={nodes.find(n => n.id === searchId) || nodes[0]} 
                            networkData={nodes}
                        />

                        <Card className="p-4 md:p-6 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <FileCode className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                                    Raw Node Data
                                </h2>
                                <span className="text-xs text-muted-foreground font-mono">
                                    Direct from pRPC
                                </span>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 md:p-4 overflow-x-auto max-h-[500px] custom-scrollbar">
                                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                                    {JSON.stringify(analysis, null, 2)}
                                </pre>
                            </div>
                        </Card>
                    </div>
                )}

                {!analysis && !isLoading && !error && (
                    <EmptyState
                        icon={<Search className="h-12 w-12 text-muted-foreground" />}
                        title="Select a Node to Inspect"
                        description="Choose a node from the dropdown above to view detailed performance metrics, storage analysis, and compliance verification."
                    />
                )}

                {isLoading && (
                    <EmptyState
                        icon={<Activity className="h-12 w-12 text-muted-foreground" />}
                        title="Analyzing Node..."
                        description="Fetching real-time performance data and metrics from the network."
                        isLoading={true}
                    />
                )}
            </main>
        </div>
    );
}
