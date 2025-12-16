import { useState } from 'react';
import { RawRPCResponse } from '@/types/pnode';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface RawRPCViewerProps {
  responses: RawRPCResponse[];
}

export function RawRPCViewer({ responses }: RawRPCViewerProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {responses.map((response, index) => (
        <div key={index} className="border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === index ? null : index)}
            className="w-full flex items-center gap-3 px-3 py-2 bg-surface-subtle hover:bg-muted transition-colors text-left"
          >
            {expanded === index ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-mono text-sm font-medium">{response.method}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {format(new Date(response.timestamp), 'HH:mm:ss')}
            </span>
          </button>
          
          {expanded === index && (
            <div className="p-3 bg-surface-inset border-t border-border">
              <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
