import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  MessageSquare, 
  Send, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap,
  Wallet
} from 'lucide-react';
import { web3AlertsService, AlertRule, AlertNotification } from '@/services/web3-alerts';

export function Web3AlertsPanel() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertNotification[]>([]);
  const [xmtpAddress, setXmtpAddress] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [isXMTPConnected, setIsXMTPConnected] = useState(false);
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);

  useEffect(() => {
    loadAlertData();
  }, []);

  const loadAlertData = () => {
    setAlertRules(web3AlertsService.getAlertRules());
    setAlertHistory(web3AlertsService.getAlertHistory());
  };

  const handleXMTPConnect = async () => {
    if (!xmtpAddress) return;
    
    try {
      // For demo purposes, we'll simulate the connection
      // In production, this would require wallet connection
      web3AlertsService.subscribeXMTPAddress(xmtpAddress);
      setIsXMTPConnected(true);
    } catch (error) {
      console.error('Failed to connect XMTP:', error);
    }
  };

  const handleTelegramConnect = () => {
    if (!telegramBotToken || !telegramChatId) return;
    
    web3AlertsService.configureTelegram(telegramBotToken, [telegramChatId]);
    setIsTelegramConnected(true);
  };

  const toggleAlertRule = (ruleId: string, enabled: boolean) => {
    web3AlertsService.updateAlertRule(ruleId, { enabled });
    loadAlertData();
  };

  const getAlertIcon = (type: AlertRule['type']) => {
    switch (type) {
      case 'node_down': return <AlertTriangle className="h-4 w-4" />;
      case 'high_latency': return <Clock className="h-4 w-4" />;
      case 'storage_full': return <Zap className="h-4 w-4" />;
      case 'sla_violation': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'major': return 'bg-orange-500';
      case 'minor': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Web3 Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            {/* XMTP Setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-medium">XMTP Messaging</h3>
                {isXMTPConnected && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="xmtp-address">Ethereum Address for XMTP</Label>
                <div className="flex gap-2">
                  <Input
                    id="xmtp-address"
                    placeholder="0x..."
                    value={xmtpAddress}
                    onChange={(e) => setXmtpAddress(e.target.value)}
                    disabled={isXMTPConnected}
                  />
                  <Button 
                    onClick={handleXMTPConnect}
                    disabled={!xmtpAddress || isXMTPConnected}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive alerts directly to your Web3 wallet via XMTP protocol (optional - install @xmtp/xmtp-js for full functionality)
                </p>
              </div>
            </div>

            {/* Telegram Setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                <h3 className="font-medium">Telegram Bot</h3>
                {isTelegramConnected && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-token">Bot Token</Label>
                <Input
                  id="telegram-token"
                  type="password"
                  placeholder="Bot token from @BotFather"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  disabled={isTelegramConnected}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-chat">Chat ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="telegram-chat"
                    placeholder="Your Telegram chat ID"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    disabled={isTelegramConnected}
                  />
                  <Button 
                    onClick={handleTelegramConnect}
                    disabled={!telegramBotToken || !telegramChatId || isTelegramConnected}
                  >
                    Connect
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your chat ID by messaging @userinfobot on Telegram
                </p>
              </div>
            </div>

            {(!isXMTPConnected && !isTelegramConnected) && (
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Connect at least one notification channel to receive alerts about your nodes.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Alert Rules</h3>
              <Badge variant="outline">{alertRules.filter(r => r.enabled).length} active</Badge>
            </div>
            
            <div className="space-y-3">
              {alertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(rule.type)}
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Channels: {rule.channels.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {rule.cooldown}m cooldown
                    </Badge>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(enabled) => toggleAlertRule(rule.id, enabled)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Recent Alerts</h3>
              <Badge variant="outline">{alertHistory.length} total</Badge>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {alertHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No alerts yet</p>
                    <p className="text-xs">Alerts will appear here when triggered</p>
                  </div>
                ) : (
                  alertHistory.map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium text-sm">{alert.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {alert.delivered ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {alert.delivered ? 'Delivered' : 'Failed'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Channels: {alert.channels.join(', ')}</span>
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}