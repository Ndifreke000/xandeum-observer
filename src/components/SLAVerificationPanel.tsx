import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, FileCheck } from 'lucide-react';
import { slaVerificationService, SLAMetrics, StorageProof } from '@/services/sla-verification';
import { PNode } from '@/types/pnode';

interface SLAVerificationPanelProps {
  node: PNode;
}

export function SLAVerificationPanel({ node }: SLAVerificationPanelProps) {
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null);
  const [storageProofs, setStorageProofs] = useState<StorageProof[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadSLAData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metrics, proofs] = await Promise.all([
        slaVerificationService.calculateSLAMetrics(node, []),
        slaVerificationService.verifyStorageProofs(node.id)
      ]);
      
      setSlaMetrics(metrics);
      setStorageProofs(proofs);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load SLA data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [node]);

  useEffect(() => {
    loadSLAData();
  }, [loadSLAData]);

  const getSLAStatusColor = (compliance: SLAMetrics['slaCompliance']) => {
    switch (compliance) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'violation': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSLAStatusIcon = (compliance: SLAMetrics['slaCompliance']) => {
    switch (compliance) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'violation': return <XCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (!slaMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SLA Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Verifying SLA compliance...</span>
              </div>
            ) : (
              <Button onClick={loadSLAData}>Load SLA Data</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SLA Verification
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getSLAStatusColor(slaMetrics.slaCompliance)}>
              {getSLAStatusIcon(slaMetrics.slaCompliance)}
              {slaMetrics.slaCompliance.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={loadSLAData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">SLA Metrics</TabsTrigger>
            <TabsTrigger value="proofs">Storage Proofs</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span>{slaMetrics.uptimePercentage.toFixed(2)}%</span>
                </div>
                <Progress value={slaMetrics.uptimePercentage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Reliability</span>
                  <span>{slaMetrics.storageReliability.toFixed(2)}%</span>
                </div>
                <Progress value={slaMetrics.storageReliability} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Proof Submission</span>
                  <span>{slaMetrics.proofSubmissionRate.toFixed(2)}%</span>
                </div>
                <Progress value={slaMetrics.proofSubmissionRate} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg Latency</span>
                  <span>{slaMetrics.averageLatency}ms</span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - (slaMetrics.averageLatency / 10))} 
                  className="h-2" 
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Last Proof Verification: {slaMetrics.lastProofVerification === 'Never' ? 
                  'Never' : 
                  new Date(slaMetrics.lastProofVerification).toLocaleString()
                }
              </div>
            </div>
          </TabsContent>

          <TabsContent value="proofs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">On-Chain Storage Proofs</h4>
              <Badge variant="outline">
                {storageProofs.length} proofs found
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {storageProofs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No storage proofs found</p>
                  <p className="text-xs">Proofs may not be available on-chain yet</p>
                </div>
              ) : (
                storageProofs.map((proof, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {proof.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-mono text-xs">
                          {proof.proofHash.substring(0, 16)}...
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(proof.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div>{(proof.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB</div>
                      <div className="text-muted-foreground">Block #{proof.blockHeight}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">SLA Violations</h4>
              <Badge variant={slaMetrics.violations.length === 0 ? "default" : "destructive"}>
                {slaMetrics.violations.length} violations
              </Badge>
            </div>
            
            <div className="space-y-2">
              {slaMetrics.violations.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No SLA violations detected. Node is performing within acceptable parameters.
                  </AlertDescription>
                </Alert>
              ) : (
                slaMetrics.violations.map((violation, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {violation.severity}
                          </Badge>
                          <span className="font-medium">{violation.type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p>{violation.description}</p>
                        <p className="text-xs opacity-75">Impact: {violation.impact}</p>
                        <p className="text-xs opacity-50">
                          {new Date(violation.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {lastUpdated && (
          <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}