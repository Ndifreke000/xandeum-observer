import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { web3AlertsService } from '@/services/web3-alerts';
import { prpcService } from '@/services/prpc';

/**
 * Hook to manage Web3 alerts monitoring in the background
 */
export function useWeb3Alerts() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch nodes data for alert monitoring
  const { data: nodes = [] } = useQuery({
    queryKey: ['pnodes-alerts'],
    queryFn: () => prpcService.getAllPNodes(),
    refetchInterval: 30000, // Check every 30 seconds
  });

  useEffect(() => {
    // Start background alert monitoring
    const startAlertMonitoring = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        if (nodes.length > 0) {
          try {
            await web3AlertsService.checkAlerts(nodes);
          } catch (error) {
            console.error('Alert monitoring error:', error);
          }
        }
      }, 60000); // Check alerts every minute
    };

    if (nodes.length > 0) {
      startAlertMonitoring();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nodes]);

  return {
    alertHistory: web3AlertsService.getAlertHistory(),
    alertRules: web3AlertsService.getAlertRules(),
    isMonitoring: intervalRef.current !== null
  };
}