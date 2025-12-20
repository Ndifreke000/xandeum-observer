import { PNode } from '@/types/pnode';

// XMTP types (optional - will be loaded dynamically if available)
type XMTPClient = Record<string, unknown> | null;
type Wallet = Record<string, unknown> | null;
import { SLAViolation } from './sla-verification';

export interface AlertRule {
  id: string;
  name: string;
  type: 'node_down' | 'high_latency' | 'storage_full' | 'sla_violation' | 'network_congestion';
  conditions: {
    threshold?: number;
    duration?: number; // minutes
    severity?: 'minor' | 'major' | 'critical';
  };
  channels: ('xmtp' | 'telegram' | 'webhook')[];
  enabled: boolean;
  cooldown: number; // minutes between alerts
  lastTriggered?: string;
}

export interface AlertNotification {
  id: string;
  ruleId: string;
  nodeId?: string;
  type: AlertRule['type'];
  severity: 'minor' | 'major' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  channels: string[];
  delivered: boolean;
  metadata?: Record<string, unknown>;
}

class Web3AlertsService {
  private xmtpClient: XMTPClient | null = null;
  private telegramBotToken: string | null = null;
  private alertRules: Map<string, AlertRule> = new Map();
  private alertHistory: AlertNotification[] = [];
  private subscribedAddresses: Set<string> = new Set();
  private telegramChatIds: Set<string> = new Set();
  private isXMTPAvailable = false;

  constructor() {
    this.initializeDefaultRules();
    this.loadConfiguration();
    this.checkXMTPAvailability();
  }

  /**
   * Check if XMTP is available (disabled for build compatibility)
   */
  private async checkXMTPAvailability() {
    // XMTP is disabled to avoid build issues
    this.isXMTPAvailable = false;
    console.log('XMTP is disabled for build compatibility.');
  }

  /**
   * Initialize XMTP client for Web3 messaging (disabled for build compatibility)
   */
  async initializeXMTP(privateKey: string): Promise<void> {
    console.warn('XMTP functionality is disabled for build compatibility. Install @xmtp/xmtp-js and ethers packages manually if needed.');
    return;
  }

  /**
   * Configure Telegram bot
   */
  configureTelegram(botToken: string, chatIds: string[]): void {
    this.telegramBotToken = botToken;
    this.telegramChatIds = new Set(chatIds);
    console.log('✅ Telegram bot configured');
  }

  /**
   * Add XMTP address for notifications
   */
  subscribeXMTPAddress(address: string): void {
    this.subscribedAddresses.add(address);
    console.log(`📧 Subscribed ${address} to XMTP alerts`);
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'node-down-critical',
        name: 'Node Offline (Critical)',
        type: 'node_down',
        conditions: { duration: 5, severity: 'critical' },
        channels: ['xmtp', 'telegram'],
        enabled: true,
        cooldown: 30
      },
      {
        id: 'high-latency-warning',
        name: 'High Latency Warning',
        type: 'high_latency',
        conditions: { threshold: 500, duration: 10, severity: 'major' },
        channels: ['xmtp'],
        enabled: true,
        cooldown: 60
      },
      {
        id: 'storage-full-critical',
        name: 'Storage Nearly Full',
        type: 'storage_full',
        conditions: { threshold: 90, severity: 'major' },
        channels: ['xmtp', 'telegram'],
        enabled: true,
        cooldown: 120
      },
      {
        id: 'sla-violation-critical',
        name: 'SLA Violation Detected',
        type: 'sla_violation',
        conditions: { severity: 'critical' },
        channels: ['xmtp', 'telegram'],
        enabled: true,
        cooldown: 60
      }
    ];

    defaultRules.forEach(rule => this.alertRules.set(rule.id, rule));
  }

  /**
   * Load configuration from localStorage or environment
   */
  private loadConfiguration(): void {
    try {
      const config = localStorage.getItem('web3-alerts-config');
      if (config) {
        const parsed = JSON.parse(config);
        if (parsed.telegramBotToken) {
          this.telegramBotToken = parsed.telegramBotToken;
        }
        if (parsed.telegramChatIds) {
          this.telegramChatIds = new Set(parsed.telegramChatIds);
        }
        if (parsed.subscribedAddresses) {
          this.subscribedAddresses = new Set(parsed.subscribedAddresses);
        }
      }
    } catch (error) {
      console.warn('Could not load alerts configuration:', error);
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfiguration(): void {
    const config = {
      telegramBotToken: this.telegramBotToken,
      telegramChatIds: Array.from(this.telegramChatIds),
      subscribedAddresses: Array.from(this.subscribedAddresses)
    };
    localStorage.setItem('web3-alerts-config', JSON.stringify(config));
  }

  /**
   * Check nodes against alert rules and trigger notifications
   */
  async checkAlerts(nodes: PNode[]): Promise<void> {
    const now = new Date();
    
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const lastTriggered = new Date(rule.lastTriggered);
        const cooldownMs = rule.cooldown * 60 * 1000;
        if (now.getTime() - lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      // Check rule conditions
      const triggeredNodes = this.evaluateRule(rule, nodes);
      
      for (const node of triggeredNodes) {
        await this.triggerAlert(rule, node);
        rule.lastTriggered = now.toISOString();
      }
    }
  }

  /**
   * Evaluate if a rule should trigger for any nodes
   */
  private evaluateRule(rule: AlertRule, nodes: PNode[]): PNode[] {
    const triggeredNodes: PNode[] = [];

    for (const node of nodes) {
      let shouldTrigger = false;

      switch (rule.type) {
        case 'node_down':
          shouldTrigger = node.status === 'offline';
          break;
          
        case 'high_latency':
          shouldTrigger = node.metrics.latency > (rule.conditions.threshold || 500);
          break;
          
        case 'storage_full':
          shouldTrigger = node.storage.usagePercent > (rule.conditions.threshold || 90) / 100;
          break;
          
        case 'sla_violation':
          // This would be triggered by the SLA verification service
          shouldTrigger = node.health.total < 80; // Simplified check
          break;
      }

      if (shouldTrigger) {
        triggeredNodes.push(node);
      }
    }

    return triggeredNodes;
  }

  /**
   * Trigger an alert notification
   */
  private async triggerAlert(rule: AlertRule, node: PNode): Promise<void> {
    const alert: AlertNotification = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      nodeId: node.id,
      type: rule.type,
      severity: rule.conditions.severity || 'major',
      title: this.generateAlertTitle(rule, node),
      message: this.generateAlertMessage(rule, node),
      timestamp: new Date().toISOString(),
      channels: rule.channels,
      delivered: false,
      metadata: {
        nodeIp: node.ip,
        nodeStatus: node.status,
        latency: node.metrics.latency,
        uptime: node.metrics.uptime,
        storageUsage: node.storage.usagePercent
      }
    };

    // Send notifications through configured channels
    const deliveryPromises = rule.channels.map(channel => {
      switch (channel) {
        case 'xmtp':
          return this.sendXMTPNotification(alert);
        case 'telegram':
          return this.sendTelegramNotification(alert);
        case 'webhook':
          return this.sendWebhookNotification(alert);
        default:
          return Promise.resolve(false);
      }
    });

    const results = await Promise.allSettled(deliveryPromises);
    alert.delivered = results.some(r => r.status === 'fulfilled' && r.value === true);

    this.alertHistory.push(alert);
    console.log(`🚨 Alert triggered: ${alert.title}`);
  }

  /**
   * Send notification via XMTP (optional)
   */
  private async sendXMTPNotification(alert: AlertNotification): Promise<boolean> {
    if (!this.isXMTPAvailable || !this.xmtpClient || this.subscribedAddresses.size === 0) {
      console.log('XMTP not available or not configured');
      return false;
    }

    try {
      const message = `🚨 ${alert.title}\n\n${alert.message}\n\nTime: ${new Date(alert.timestamp).toLocaleString()}`;
      
      for (const address of this.subscribedAddresses) {
        const conversation = await this.xmtpClient.conversations.newConversation(address);
        await conversation.send(message);
      }
      
      console.log(`📧 XMTP alert sent to ${this.subscribedAddresses.size} addresses`);
      return true;
    } catch (error) {
      console.error('Failed to send XMTP notification:', error);
      return false;
    }
  }

  /**
   * Send notification via Telegram
   */
  private async sendTelegramNotification(alert: AlertNotification): Promise<boolean> {
    if (!this.telegramBotToken || this.telegramChatIds.size === 0) {
      return false;
    }

    try {
      const emoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'major' ? '🟡' : '🟢';
      const message = `${emoji} *${alert.title}*\n\n${alert.message}\n\n⏰ ${new Date(alert.timestamp).toLocaleString()}`;
      
      for (const chatId of this.telegramChatIds) {
        const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      }
      
      console.log(`📱 Telegram alert sent to ${this.telegramChatIds.size} chats`);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  /**
   * Send notification via webhook
   */
  private async sendWebhookNotification(alert: AlertNotification): Promise<boolean> {
    // Implementation for webhook notifications (Discord, Slack, etc.)
    return false;
  }

  /**
   * Generate alert title
   */
  private generateAlertTitle(rule: AlertRule, node: PNode): string {
    switch (rule.type) {
      case 'node_down':
        return `Node ${node.id.substring(0, 8)}... is OFFLINE`;
      case 'high_latency':
        return `High Latency Alert: ${node.metrics.latency}ms`;
      case 'storage_full':
        return `Storage Alert: ${(node.storage.usagePercent * 100).toFixed(1)}% Full`;
      case 'sla_violation':
        return `SLA Violation: Node ${node.id.substring(0, 8)}...`;
      default:
        return `Network Alert: ${rule.name}`;
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, node: PNode): string {
    const baseInfo = `Node: ${node.id}\nIP: ${node.ip}\nStatus: ${node.status}`;
    
    switch (rule.type) {
      case 'node_down':
        return `${baseInfo}\n\nThe node has gone offline and is no longer responding to network requests. This may impact storage availability and network reliability.`;
      case 'high_latency':
        return `${baseInfo}\nLatency: ${node.metrics.latency}ms\nUptime: ${node.metrics.uptime.toFixed(1)}%\n\nNode is experiencing high latency which may affect user experience.`;
      case 'storage_full':
        return `${baseInfo}\nStorage Used: ${(node.storage.usagePercent * 100).toFixed(1)}%\nCapacity: ${(node.storage.committed / 1024 / 1024 / 1024).toFixed(2)} GB\n\nNode storage is nearly full and may need capacity expansion.`;
      case 'sla_violation':
        return `${baseInfo}\nHealth Score: ${node.health.total}/100\n\nNode is not meeting SLA requirements and may need attention.`;
      default:
        return baseInfo;
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 50): AlertNotification[] {
    return this.alertHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      this.alertRules.set(ruleId, { ...rule, ...updates });
      this.saveConfiguration();
    }
  }
}

export const web3AlertsService = new Web3AlertsService();