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
import { TrafficDistribution } from '@/components/TrafficDistribution';
import { IOBehavior } from '@/components/IOBehavior';
import { PeerInteractionProfile } from '@/components/PeerInteractionProfile';
import { NodePerformanceSignals } from '@/components/NodePerformanceSignals';
import { Search, RefreshCw, Clock, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
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
            <Header />

            <main className="flex-1 w-full px-6 py-6 space-y-6">
                {/* Search & Controls */}
                <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
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
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Analysis Content */}
                {analysis && !error && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Identity & Overview */}
                        <NodeIdentity analysis={analysis} />

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TrafficDistribution analysis={analysis} />
                            <IOBehavior analysis={analysis} />
                        </div>

                        {/* Secondary Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <PeerInteractionProfile analysis={analysis} />
                            </div>
                            <div>
                                <NodePerformanceSignals analysis={analysis} />
                            </div>
                        </div>
                    </div>
                )}

                {!analysis && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <Search className="h-12 w-12 opacity-20" />
                        <p className="text-lg">Select a Node ID to begin analysis</p>
                    </div>
                )}
            </main>
        </div>
    );
}
