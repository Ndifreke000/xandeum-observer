import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Search, RefreshCw, Clock, ArrowLeft, Check, ChevronsUpDown, FileCode, Zap } from 'lucide-react';
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
            fetchAnalysis(nodeId.trim()); // Reusing fetchAnalysis but passing Node ID
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
            {/* Header */}
            <Header
                nodes={nodes}
                onSelectNode={(node) => {
                    setNodeId(node.id);
                    setSearchId(node.id);
                    fetchAnalysis(node.id);
                }}
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
                {/* Search & Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Node Inspector</h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time deep dive into individual node performance
                        </p>
                    </div>
                    <div className="flex-1 w-full md:max-w-2xl flex gap-2">
                        <div className="relative flex-1">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {nodeId
                                            ? nodes.find((node) => node.id === nodeId)?.id || nodeId
                                            : "Select or enter Node ID..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search node ID..." />
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
                                                            <span>{node.id}</span>
                                                            <span className="text-xs text-muted-foreground">{node.ip}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button onClick={handleSearch} disabled={isLoading || !nodeId}>
                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Analyze</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="auto-refresh"
                                checked={autoRefreshEnabled}
                                onCheckedChange={handleAutoRefreshToggle}
                            />
                            <Label htmlFor="auto-refresh" className="text-sm whitespace-nowrap">Auto-refresh</Label>
                        </div>

                        <Select
                            value={refreshInterval}
                            onValueChange={handleRefreshIntervalChange}
                            disabled={!autoRefreshEnabled}
                        >
                            <SelectTrigger className="w-[100px]">
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

                {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                        <div className="flex flex-col gap-3">
                            <AlertDescription className="font-medium">{error}</AlertDescription>
                            {error.includes("not found") && (
                                <div className="flex flex-col gap-2 p-3 bg-background/50 rounded-md border border-destructive/10">
                                    <p className="text-sm text-muted-foreground">
                                        Node not found in the network. Please verify the Node ID.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Alert>
                )}

                {/* Analysis Content */}
                {analysis && !error && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Identity & Overview */}
                        <NodeIdentity analysis={analysis} />

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <NodePerformanceSignals analysis={analysis} />
                            {analysis.storage && (
                                <StorageAnalysis analysis={analysis} storage={analysis.storage} />
                            )}
                        </div>

                        {/* Advanced Features Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <SLAVerificationPanel node={nodes.find(n => n.id === searchId) || nodes[0]} />
                            <Web3AlertsPanel />
                        </div>

                        {/* AI Optimization Panel */}
                        <RewardOptimizationPanel 
                            node={nodes.find(n => n.id === searchId) || nodes[0]} 
                            networkData={nodes}
                        />

                        {/* Raw Data Inspector (Honest Deep Dive) */}
                        <Card className="p-6 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <FileCode className="h-5 w-5 text-muted-foreground" />
                                    Raw Node Data
                                </h2>
                                <span className="text-xs text-muted-foreground font-mono">
                                    Direct from pRPC
                                </span>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto max-h-[500px] custom-scrollbar">
                                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                                    {JSON.stringify(analysis, null, 2)}
                                </pre>
                            </div>
                        </Card>
                    </div>
                )}

                {!analysis && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <Search className="h-12 w-12 opacity-20" />
                        <p className="text-lg">Select a Node ID to begin analysis</p>
                    </div>
                )}
            </main>
        </div >
    );
}
