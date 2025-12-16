import { PNodeStatus } from '@/types/pnode';

interface StatusBadgeProps {
  status: PNodeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    online: { label: 'Online', className: 'status-online' },
    unstable: { label: 'Unstable', className: 'status-unstable' },
    offline: { label: 'Offline', className: 'status-offline' },
  };

  const { label, className } = config[status];

  return (
    <span className={`status-badge ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'online' ? 'bg-status-online animate-pulse-subtle' :
        status === 'unstable' ? 'bg-status-unstable' : 'bg-status-offline'
      }`} />
      {label}
    </span>
  );
}
