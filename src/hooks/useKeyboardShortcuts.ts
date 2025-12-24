import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

export function useKeyboardShortcuts(onRefresh?: () => void, onSearch?: () => void) {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Cmd/Ctrl + K or / for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
        return;
      }
      
      if (e.key === '/') {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Navigation shortcuts with Cmd/Ctrl
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            navigate('/');
            toast({ title: '📊 Dashboard', description: 'Viewing main dashboard' });
            break;
          case '2':
            e.preventDefault();
            navigate('/nodes/inspector');
            toast({ title: '🔍 Inspector', description: 'Viewing node inspector' });
            break;
          case '3':
            e.preventDefault();
            navigate('/advanced');
            toast({ title: '⚡ Advanced', description: 'Viewing advanced features' });
            break;
          case '4':
            e.preventDefault();
            navigate('/intelligence');
            toast({ title: '🧠 Intelligence', description: 'Viewing network intelligence' });
            break;
          case 'r':
            e.preventDefault();
            onRefresh?.();
            toast({ title: '🔄 Refreshing', description: 'Fetching latest data...' });
            break;
        }
        return;
      }

      // Single key shortcuts
      switch (e.key) {
        case 'r':
        case 'R':
          e.preventDefault();
          onRefresh?.();
          toast({ title: '🔄 Refreshing', description: 'Fetching latest data...' });
          break;

        case '?':
          e.preventDefault();
          toast({
            title: '⌨️ Keyboard Shortcuts',
            description: (
              <div className="text-xs space-y-2 mt-2 font-mono">
                <div className="flex justify-between gap-4">
                  <kbd className="px-2 py-1 bg-muted rounded text-[10px]">⌘/Ctrl + K</kbd>
                  <span>Search nodes</span>
                </div>
                <div className="flex justify-between gap-4">
                  <kbd className="px-2 py-1 bg-muted rounded text-[10px]">⌘/Ctrl + 1-4</kbd>
                  <span>Navigate pages</span>
                </div>
                <div className="flex justify-between gap-4">
                  <kbd className="px-2 py-1 bg-muted rounded text-[10px]">R</kbd>
                  <span>Refresh data</span>
                </div>
                <div className="flex justify-between gap-4">
                  <kbd className="px-2 py-1 bg-muted rounded text-[10px]">?</kbd>
                  <span>Show shortcuts</span>
                </div>
                <div className="flex justify-between gap-4">
                  <kbd className="px-2 py-1 bg-muted rounded text-[10px]">Esc</kbd>
                  <span>Close panels</span>
                </div>
              </div>
            ),
            duration: 8000,
          });
          break;

        case 'g':
          // Vim-style navigation
          const nextKey = (e2: KeyboardEvent) => {
            e2.preventDefault();
            switch (e2.key) {
              case 'h':
                navigate('/');
                toast({ title: '📊 Dashboard' });
                break;
              case 'i':
                navigate('/nodes/inspector');
                toast({ title: '🔍 Inspector' });
                break;
              case 'a':
                navigate('/advanced');
                toast({ title: '⚡ Advanced' });
                break;
              case 'n':
                navigate('/intelligence');
                toast({ title: '🧠 Intelligence' });
                break;
            }
            window.removeEventListener('keydown', nextKey);
          };
          window.addEventListener('keydown', nextKey);
          setTimeout(() => window.removeEventListener('keydown', nextKey), 2000);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, onRefresh, onSearch, toast]);
}
