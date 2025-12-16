import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
    const [searchAddress, setSearchAddress] = useState('');
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
            setSearchAddress(contractAddress.trim());
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

    const handleRefresh = () => {
        if (searchAddress) {
            fetchAnalysis(searchAddress);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="gap-2 -ml-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-semibold">Contract EDA</h1>
                                <p className="text-sm text-muted-foreground">
                                    Exploratory Data Analysis for Smart Contracts
                                </p>
                            </div>
                        </div>
                        {lastUpdated && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="hidden sm:inline">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
                                <span className="sm:hidden">{new Date(lastUpdated).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full px-6 py-6 space-y-6">
                {/* Search & Controls */}
                <Card className="p-6">
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter contract address (44-character base58)..."
                                    value={contractAddress}
                                    onChange={(e) => setContractAddress(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                    className="font-mono"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSearch}
                                    disabled={isLoading || !contractAddress.trim()}
                                    className="gap-2 flex-1 sm:flex-none"
                                >
                                    <Search className="h-4 w-4" />
                                    Analyze
                                </Button>
                                {analysis && (
                                    <Button
                                        variant="outline"
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                        className="gap-2 flex-1 sm:flex-none"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Auto-Refresh Controls */}
                        {analysis && (
                            <div className="flex items-center gap-6 pt-2 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="auto-refresh"
                                        checked={autoRefreshEnabled}
                                        onCheckedChange={handleAutoRefreshToggle}
                                    />
                                    <Label htmlFor="auto-refresh" className="cursor-pointer">
                                        Auto-refresh
                                    </Label>
                                </div>
                                {autoRefreshEnabled && (
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="interval" className="text-sm text-muted-foreground">
                                            Interval:
                                        </Label>
                                        <Select value={refreshInterval} onValueChange={handleRefreshIntervalChange}>
                                            <SelectTrigger id="interval" className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15000">15 seconds</SelectItem>
                                                <SelectItem value="30000">30 seconds</SelectItem>
                                                <SelectItem value="60000">60 seconds</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading && !analysis && (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Analyzing contract...</p>
                        </div>
                    </Card>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <div className="space-y-6">
                        {/* Contract Identity */}
                        <ContractIdentity identity={analysis.identity} />

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ActivityDistribution activity={analysis.activity} />
                            <ReadWriteBehavior readWrite={analysis.readWrite} />
                        </div>

                        {/* Full Width Components */}
                        <PNodeInteractionProfile profile={analysis.pNodeProfile} />
                        <PerformanceSignals performance={analysis.performance} />
                    </div>
                )}

                {/* Empty State */}
                {!analysis && !isLoading && !error && (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <Search className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">No Contract Analyzed Yet</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Enter a contract address above to view comprehensive exploratory analysis
                                    including activity patterns, read/write behavior, pNode interactions, and
                                    performance metrics.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}
