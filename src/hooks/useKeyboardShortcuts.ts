import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts(onRefresh?: () => void, onSearch?: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K or / for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      } else if (e.key === '/') {
        e.preventDefault();
        onSearch?.();
      }

      // R for refresh
      else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRefresh?.();
      }

      // G + H for home
      else if (e.key === 'g') {
        const nextKey = (e2: KeyboardEvent) => {
          if (e2.key === 'h') navigate('/');
          else if (e2.key === 'a') navigate('/advanced');
          else if (e2.key === 'i') navigate('/intelligence');
          else if (e2.key === 'n') navigate('/nodes/inspector');
          window.removeEventListener('keydown', nextKey);
        };
        window.addEventListener('keydown', nextKey);
        setTimeout(() => window.removeEventListener('keydown', nextKey), 2000);
      }

      // ? for help
      else if (e.key === '?') {
        e.preventDefault();
        showKeyboardShortcutsHelp();
      }

      // Escape to close modals/panels
      else if (e.key === 'Escape') {
        // This will be handled by individual components
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, onRefresh, onSearch]);
}

function showKeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: '/', description: 'Focus search' },
    { keys: 'Ctrl/Cmd + K', description: 'Quick search' },
    { keys: 'R', description: 'Refresh data' },
    { keys: 'G then H', description: 'Go to Home' },
    { keys: 'G then A', description: 'Go to Advanced Features' },
    { keys: 'G then I', description: 'Go to Intelligence' },
    { keys: 'G then N', description: 'Go to Node Inspector' },
    { keys: '?', description: 'Show this help' },
    { keys: 'Esc', description: 'Close modals' }
  ];

  const helpText = shortcuts
    .map(s => `${s.keys.padEnd(20)} - ${s.description}`)
    .join('\n');

  alert(`Keyboard Shortcuts:\n\n${helpText}`);
}
