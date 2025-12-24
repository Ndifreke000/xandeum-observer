import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  isLoading?: boolean;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  isLoading = false 
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {isLoading ? (
          <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
        ) : icon ? (
          <div className="mb-4">{icon}</div>
        ) : null}
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
