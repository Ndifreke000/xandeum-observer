import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Zap,
  Database,
  Clock,
  Award,
  Info
} from 'lucide-react';
import {
  calculateEarnings,
  getRecommendedConfigs,
  compareToNetwork,
  type NodeConfiguration,
  type OperatorCosts
} from '@/services/earnings-calculator';
import { PNode } from '@/types/pnode';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EarningsCalculatorProps {
  nodes: PNode[];
}

export function EarningsCalculator({ nodes }: EarningsCalculatorProps) {
  const [config, setConfig] = useState<NodeConfiguration>({
    storageGB: 500,
    uptime: 99,
    latency: 100
  });

  const [costs, setCosts] = useState<OperatorCosts>({
    hardwareCost: 1000,
    monthlyElectricity: 40,
    monthlyBandwidth: 40,
    monthlyMaintenance: 20
  });

  const earnings = calculateEarnings(config, costs, nodes);
  const comparison = compareToNetwork(config, nodes);
  const recommended = getRecommendedConfigs();

  const applyPreset = (preset: typeof recommended[0]) => {
    setConfig(preset.config);
    setCosts(preset.costs);
  };

  const totalMonthlyCost = costs.monthlyElectricity + costs.monthlyBandwidth + costs.monthlyMaintenance;
  const monthlyProfit = earnings.monthly - totalMonthlyCost;
  const yearlyProfit = earnings.yearly - (totalMonthlyCost * 12);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              STOINC Earnings Calculator
            </CardTitle>
            <CardDescription>
              Calculate potential earnings and ROI for running a pNode
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommended.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto py-3 px-4 flex flex-col items-start gap-1"
                onClick={() => applyPreset(preset)}
              >
                <span className="font-bold">{preset.name}</span>
                <span className="text-xs text-muted-foreground">{preset.description}</span>
                <span className="text-xs font-mono text-primary">{preset.config.storageGB}GB</span>
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4 mt-4">
            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Storage Capacity
                </Label>
                <span className="text-sm font-mono font-bold">{config.storageGB} GB</span>
              </div>
              <Slider
                value={[config.storageGB]}
                onValueChange={([value]) => setConfig({ ...config, storageGB: value })}
                min={100}
                max={5000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 GB</span>
                <span>5 TB</span>
              </div>
            </div>

            {/* Uptime */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Target Uptime
                </Label>
                <span className="text-sm font-mono font-bold">{config.uptime}%</span>
              </div>
              <Slider
                value={[config.uptime]}
                onValueChange={([value]) => setConfig({ ...config, uptime: value })}
                min={90}
                max={100}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>90%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Latency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Expected Latency
                </Label>
                <span className="text-sm font-mono font-bold">{config.latency} ms</span>
              </div>
              <Slider
                value={[config.latency]}
                onValueChange={([value]) => setConfig({ ...config, latency: value })}
                min={20}
                max={500}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20 ms</span>
                <span>500 ms</span>
              </div>
            </div>

            {/* Network Comparison */}
            <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="h-4 w-4 text-primary" />
                Network Comparison
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Storage</div>
                  <div className="font-bold">{comparison.storagePercentile}th percentile</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Uptime</div>
                  <div className="font-bold">{comparison.uptimePercentile}th percentile</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Latency</div>
                  <div className="font-bold">{comparison.latencyPercentile}th percentile</div>
                </div>
              </div>
              <Badge className="mt-2">{comparison.overallRank}</Badge>
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4 mt-4">
            {/* Hardware Cost */}
            <div className="space-y-2">
              <Label>Initial Hardware Cost</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={costs.hardwareCost}
                  onChange={(e) => setCosts({ ...costs, hardwareCost: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Monthly Electricity */}
            <div className="space-y-2">
              <Label>Monthly Electricity</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={costs.monthlyElectricity}
                  onChange={(e) => setCosts({ ...costs, monthlyElectricity: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Monthly Bandwidth */}
            <div className="space-y-2">
              <Label>Monthly Bandwidth</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={costs.monthlyBandwidth}
                  onChange={(e) => setCosts({ ...costs, monthlyBandwidth: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Monthly Maintenance */}
            <div className="space-y-2">
              <Label>Monthly Maintenance</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  value={costs.monthlyMaintenance}
                  onChange={(e) => setCosts({ ...costs, monthlyMaintenance: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Cost Summary */}
            <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Monthly Cost</span>
                <span className="font-bold">${totalMonthlyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Yearly Cost</span>
                <span className="font-bold">${(totalMonthlyCost * 12).toFixed(2)}</span>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4 mt-4">
            {/* Earnings Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Daily</div>
                <div className="text-lg font-bold text-green-500">
                  {earnings.daily.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">STOINC</div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Weekly</div>
                <div className="text-lg font-bold text-blue-500">
                  {earnings.weekly.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">STOINC</div>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Monthly</div>
                <div className="text-lg font-bold text-purple-500">
                  {earnings.monthly.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">STOINC</div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Yearly</div>
                <div className="text-lg font-bold text-orange-500">
                  {earnings.yearly.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">STOINC</div>
              </div>
            </div>

            {/* Profitability */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg space-y-3">
              <div className="flex items-center gap-2 font-medium">
                <DollarSign className="h-4 w-4 text-primary" />
                Profitability Analysis
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Monthly Profit</div>
                  <div className={`text-lg font-bold ${monthlyProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${monthlyProfit.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Yearly Profit</div>
                  <div className={`text-lg font-bold ${yearlyProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${yearlyProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Break-Even</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Days until hardware cost is recovered</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-2xl font-bold">
                  {earnings.breakEvenDays > 0 ? `${earnings.breakEvenDays} days` : 'N/A'}
                </div>
                {earnings.breakEvenDays > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    ~{Math.ceil(earnings.breakEvenDays / 30)} months
                  </div>
                )}
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Yearly ROI</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Return on investment after 1 year</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={`text-2xl font-bold ${earnings.roi > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {earnings.roi.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {earnings.roi > 50 ? 'Excellent' : earnings.roi > 25 ? 'Good' : earnings.roi > 0 ? 'Fair' : 'Unprofitable'}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-muted-foreground">
              <strong>Note:</strong> Calculations are estimates based on current network data. 
              Actual earnings may vary based on network conditions, storage demand, and node performance.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
