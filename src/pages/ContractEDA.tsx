import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { useContractAnalysis } from '@/hooks/useContractAnalysis';
import { ContractIdentity } from '@/components/ContractIdentity';
import { ActivityDistribution } from '@/components/ActivityDistribution';
import { ReadWriteBehavior } from '@/components/ReadWriteBehavior';
import { PNodeInteractionProfile } from '@/components/PNodeInteractionProfile';
import { PerformanceSignals } from '@/components/PerformanceSignals';
import { Search, RefreshCw, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContractEDA() {
    const navigate = useNavigate();
    const [contractAddress, setContractAddress] = useState('');
    const [refreshInterval, setRefreshInterval] = useState('30000');

    const {
        analysis,
        isLoading,
        error,
        fetchAnalysis,
        setAutoRefresh,
        setRefreshInterval: updateRefreshInterval,
        lastUpdated,
    } = useContractAnalysis();

    const [autoRefreshEnabled, setAutoRefreshEnabledState] = useState(false);

    const handleSearch = () => {
        if (contractAddress.trim()) {
            fetchAnalysis(contractAddress.trim());
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

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <Header />

            <main className="flex-1 w-full px-6 py-6 space-y-6">
                {/* Search & Controls */}
                <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                        <div className="flex-1 w-full md:max-w-xl flex gap-2">
                            <Input
                                placeholder="Enter Contract Address..."
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                className="font-mono"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isLoading || !contractAddress}>
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
                        <ContractIdentity identity={analysis.identity} />

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ActivityDistribution activity={analysis.activity} />
                            <ReadWriteBehavior readWrite={analysis.readWrite} />
                        </div>

                        {/* Secondary Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <PNodeInteractionProfile profile={analysis.pNodeProfile} />
                            </div>
                            <div>
                                <PerformanceSignals performance={analysis.performance} />
                            </div>
                        </div>
                    </div>
                )}

                {!analysis && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <Search className="h-12 w-12 opacity-20" />
                        <p className="text-lg">Enter a contract address to begin analysis</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setContractAddress('TokenSwapProgramV2_abc123xyz');
                                    fetchAnalysis('TokenSwapProgramV2_abc123xyz');
                                }}
                            >
                                Try Example
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
