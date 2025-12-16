import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateBlockDataFlow } from '@/lib/mock-contract-data';
import { BlockDataFlow, TransactionFlow } from '@/types/contract';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { xandeumSDK } from '@/services/xandeum-sdk';

export default function DataFlowVisual() {
    const navigate = useNavigate();
    const [blockNumber, setBlockNumber] = useState('');
    const [blockData, setBlockData] = useState<BlockDataFlow | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Xandeum SDK State
    const [fsid, setFsid] = useState('1');
    const [filePath, setFilePath] = useState('/hello.txt');
    const [readResult, setReadResult] = useState<string | null>(null);
    const [isReading, setIsReading] = useState(false);

    const handleRead = async () => {
        setIsReading(true);
        setReadResult(null);
        try {
            const result = await xandeumSDK.readData(fsid, filePath, 0, 100);
            setReadResult(xandeumSDK.parseResultToString(result));
        } catch (error: any) {
            setReadResult(`Error: ${error.message || error}`);
        } finally {
            setIsReading(false);
        }
    };

    const handleLoadBlock = () => {
        if (blockNumber.trim()) {
            const data = generateBlockDataFlow(parseInt(blockNumber));
            setBlockData(data);
            setCurrentStep(0);
            setIsPlaying(false);
        }
    };

    // Auto-play animation
    useEffect(() => {
        if (!isPlaying || !blockData) return;

        const totalSteps = blockData.transactions.reduce(
            (sum, tx) => sum + tx.steps.length,
            0
        );

        if (currentStep >= totalSteps) {
            setIsPlaying(false);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, 1000 / playbackSpeed);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, blockData, playbackSpeed]);

    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const totalSteps = blockData
        ? blockData.transactions.reduce((sum, tx) => sum + tx.steps.length, 0)
        : 0;

    const getCurrentTx = (): {
        tx: TransactionFlow;
        stepIndex: number;
    } | null => {
        if (!blockData) return null;

        let stepCount = 0;
        for (const tx of blockData.transactions) {
            if (currentStep < stepCount + tx.steps.length) {
                return {
                    tx,
                    stepIndex: currentStep - stepCount,
                };
            }
            stepCount += tx.steps.length;
        }

        return null;
    };

    const currentTxInfo = getCurrentTx();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">Data Flow Visualization</h1>
                            <p className="text-sm text-muted-foreground">
                                Real-time visualization of transaction data flow
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-6 space-y-6">
                {/* Block Input */}
                <Card className="p-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter block number..."
                            value={blockNumber}
                            onChange={(e) => setBlockNumber(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLoadBlock();
                            }}
                            type="number"
                            className="font-mono"
                        />
                        <Button onClick={handleLoadBlock} disabled={!blockNumber.trim()}>
                            Load Block
                        </Button>
                    </div>
                </Card>

                {/* Xandeum File Reader (SDK Test) */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Xandeum File Reader (SDK Test)</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-muted-foreground mb-1 block">File System ID</label>
                            <Input
                                value={fsid}
                                onChange={(e) => setFsid(e.target.value)}
                                placeholder="FSID (e.g., 1)"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-muted-foreground mb-1 block">File Path</label>
                            <Input
                                value={filePath}
                                onChange={(e) => setFilePath(e.target.value)}
                                placeholder="/path/to/file.txt"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleRead} disabled={isReading}>
                                {isReading ? 'Reading...' : 'Read Data'}
                            </Button>
                        </div>
                    </div>
                    {readResult && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-md font-mono text-xs overflow-auto max-h-40">
                            {readResult}
                        </div>
                    )}
                </Card>

                {blockData && (
                    <>
                        {/* Block Info */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Block #{blockData.blockNumber}
                                        </h2>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {blockData.blockHash}
                                        </p>
                                    </div>
                                    <Badge>{blockData.transactions.length} transactions</Badge>
                                </div>

                                {/* Playback Controls */}
                                <div className="flex items-center gap-4 pt-4 border-t border-border">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="gap-2"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="h-4 w-4" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                Play
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                                        <RotateCcw className="h-4 w-4" />
                                        Reset
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Speed:</span>
                                        {[0.5, 1, 2].map((speed) => (
                                            <Button
                                                key={speed}
                                                variant={playbackSpeed === speed ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setPlaybackSpeed(speed)}
                                            >
                                                {speed}x
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="ml-auto text-sm text-muted-foreground font-mono">
                                        Step {currentStep} / {totalSteps}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <Progress value={(currentStep / totalSteps) * 100} />
                            </div>
                        </Card>

                        {/* Current Transaction Info */}
                        {currentTxInfo && (
                            <Card className="p-6 bg-[hsl(var(--chart-1)/.05)]">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">Current Transaction</h3>
                                        <Badge variant="outline">{currentTxInfo.tx.operationType}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">TX ID:</span>
                                            <span className="ml-2 font-mono">{currentTxInfo.tx.transactionId}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Contract:</span>
                                            <span className="ml-2 font-mono text-xs">
                                                {currentTxInfo.tx.contractAddress.substring(0, 20)}...
                                            </span>
                                        </div>
                                    </div>
                                    <div className="font-semibold text-[hsl(var(--chart-1))]">
                                        {currentTxInfo.stepIndex >= 0 &&
                                            currentTxInfo.stepIndex < currentTxInfo.tx.steps.length && (
                                                <div>
                                                    Step {currentTxInfo.stepIndex + 1}:{' '}
                                                    {currentTxInfo.tx.steps[currentTxInfo.stepIndex].action} on{' '}
                                                    {currentTxInfo.tx.steps[currentTxInfo.stepIndex].nodeId}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Transactions List */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {blockData.transactions.map((tx, txIdx) => {
                                const txStartStep = blockData.transactions
                                    .slice(0, txIdx)
                                    .reduce((sum, t) => sum + t.steps.length, 0);
                                const txEndStep = txStartStep + tx.steps.length;
                                const isActive = currentStep >= txStartStep && currentStep < txEndStep;

                                return (
                                    <Card
                                        key={tx.transactionId}
                                        className={`p-4 transition-all ${isActive ? 'ring-2 ring-[hsl(var(--chart-1))]' : ''
                                            }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant={isActive ? 'default' : 'secondary'}>
                                                    TX {txIdx + 1}
                                                </Badge>
                                                <Badge variant="outline">{tx.operationType}</Badge>
                                            </div>
                                            <div className="text-xs space-y-1">
                                                <div className="font-mono truncate">
                                                    {tx.transactionId}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {tx.steps.length} steps • {tx.duration}ms • {tx.dataSize} bytes
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                {tx.steps.map((step, stepIdx) => {
                                                    const globalStepIndex = txStartStep + stepIdx;
                                                    const isPast = currentStep > globalStepIndex;
                                                    const isCurrent = currentStep === globalStepIndex;

                                                    return (
                                                        <div
                                                            key={step.stepNumber}
                                                            className={`text-xs p-2 rounded transition-all ${isCurrent
                                                                ? 'bg-[hsl(var(--chart-1)/.15)] text-[hsl(var(--chart-1))]'
                                                                : isPast
                                                                    ? 'bg-surface-inset text-muted-foreground'
                                                                    : 'bg-surface-subtle text-muted-foreground/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">
                                                                    {step.stepNumber}. {step.action}
                                                                </span>
                                                                <span className="font-mono">{step.latency}ms</span>
                                                            </div>
                                                            <div className="text-[10px] mt-1">
                                                                {step.nodeId} • {step.dataTransferred} bytes
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!blockData && (
                    <Card className="p-12">
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <Play className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">No Block Loaded</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Enter a block number above to visualize the data flow of transactions within
                                    that block. Watch how data moves through the network in real-time.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}
