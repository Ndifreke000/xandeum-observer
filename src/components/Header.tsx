import { Button } from '@/components/ui/button';
import { RefreshCw, Menu, FileCode, Network, Activity, Brain, Download, Bookmark } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from 'react';
import { PNode } from '@/types/pnode';
import { CommandMenu } from './CommandMenu';
import { NetworkHealth } from './NetworkHealth';
import { ThemeToggle } from './ThemeToggle';
import { exportToCSV, exportToJSON, exportSummaryToJSON, exportSummaryToPDF } from '@/utils/export';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  nodes?: PNode[];
  onSelectNode?: (node: PNode) => void;
}

export const Header = ({
  onRefresh,
  isLoading,
  lastUpdated,
  nodes = [],
  onSelectNode = () => { }
}: HeaderProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link to="/">
        <Button
          variant={isActive('/') ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setIsOpen(false)}
        >
          <Network className="w-4 h-4" />
          pNodes
        </Button>
      </Link>

      <div className="md:hidden space-y-1 pl-4 border-l-2 border-border/50 ml-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-4">Deep Dive</div>
        <Link to="/nodes/inspector">
          <Button
            variant={isActive('/nodes/inspector') ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 text-sm h-9"
            onClick={() => setIsOpen(false)}
          >
            <Activity className="w-4 h-4" />
            Node Inspector
          </Button>
        </Link>
        <Link to="/advanced">
          <Button
            variant={isActive('/advanced') ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 text-sm h-9"
            onClick={() => setIsOpen(false)}
          >
            <FileCode className="w-4 h-4" />
            Advanced Features
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="w-full flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
        {/* Left: Logo & Health */}
        <div className="flex items-center gap-2 md:gap-6">
          <Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
            <div className="relative flex h-7 w-7 md:h-8 md:w-8 items-center justify-center">
              <img src="/logo.png" alt="Xandeum Logo" className="h-7 w-7 md:h-8 md:w-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Xandeum
              </span>
              <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground leading-none">
                Network Observer
              </span>
            </div>
          </Link>

          <div className="hidden lg:block">
            <NetworkHealth nodes={nodes} />
          </div>
        </div>

        {/* Center: Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-xs lg:max-w-md">
            <CommandMenu nodes={nodes} onSelectNode={onSelectNode} />
          </div>
        </div>

        {/* Right: Navigation & Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Button variant={isActive('/') ? "secondary" : "ghost"} size="icon" className="h-9 w-9">
                      <Network className="w-4 h-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home Dashboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/nodes/inspector">
                    <Button variant={location.pathname.startsWith('/nodes') ? "secondary" : "ghost"} size="icon" className="h-9 w-9">
                      <Activity className="w-4 h-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Node Inspector</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/advanced">
                    <Button variant={isActive('/advanced') ? "secondary" : "ghost"} size="icon" className="h-9 w-9">
                      <FileCode className="w-4 h-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Advanced Features</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/intelligence">
                    <Button variant={isActive('/intelligence') ? "secondary" : "ghost"} size="icon" className="h-9 w-9">
                      <Brain className="w-4 h-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Network Intelligence</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-6 bg-border mx-1" />

            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportToCSV(nodes)}>
                  Export Nodes (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportToJSON(nodes)}>
                  Export Nodes (JSON)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportSummaryToPDF(nodes)}>
                  <span className="font-medium">Export Summary (PDF)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportSummaryToJSON(nodes)}>
                  Export Summary (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] pr-0">
              <div className="flex flex-col gap-6 mt-6 pr-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Navigation</h3>
                  <NavLinks />
                </div>

                <div className="px-2">
                  <div className="w-full mb-4">
                    <CommandMenu nodes={nodes} onSelectNode={onSelectNode} />
                  </div>
                  <div className="flex gap-2 mb-2">
                    <ThemeToggle />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportToCSV(nodes)}>
                          Export Nodes (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToJSON(nodes)}>
                          Export Nodes (JSON)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => exportSummaryToPDF(nodes)}>
                          <span className="font-medium">Export Summary (PDF)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportSummaryToJSON(nodes)}>
                          Export Summary (JSON)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
