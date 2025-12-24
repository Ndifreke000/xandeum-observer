import { Button } from '@/components/ui/button';
import { RefreshCw, Menu, FileCode, Network, Search, Sun, Moon, Github, BookOpen, ChevronDown, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import React from "react"

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

import { PNode } from '@/types/pnode';
import { CommandMenu } from './CommandMenu';
import { NetworkHealth } from './NetworkHealth';

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
  const [isDark, setIsDark] = useState(true); // Default to dark mode as requested

  const isActive = (path: string) => location.pathname === path;

  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!lastUpdated) return;

    // Reset timer when lastUpdated changes
    setTimeLeft(10);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdated]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In a real app, this would toggle a class on the html element
    document.documentElement.classList.toggle('dark');
  };

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

        {/* Center: Navigation & Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-4 lg:gap-6 px-4">
          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button variant={isActive('/') ? "secondary" : "ghost"} size="sm" className="gap-2 h-8 md:h-9 text-xs md:text-sm">
                <Network className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden lg:inline">pNodes</span>
              </Button>
            </Link>
            <Link to="/nodes/inspector">
              <Button variant={location.pathname.startsWith('/nodes') ? "secondary" : "ghost"} size="sm" className="gap-2 h-8 md:h-9 text-xs md:text-sm">
                <Activity className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden lg:inline">Inspector</span>
              </Button>
            </Link>
            <Link to="/advanced">
              <Button variant={isActive('/advanced') ? "secondary" : "ghost"} size="sm" className="gap-2 h-8 md:h-9 text-xs md:text-sm">
                <FileCode className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden lg:inline">Advanced</span>
              </Button>
            </Link>
          </nav>

          <div className="w-full max-w-xs lg:max-w-sm">
            <CommandMenu nodes={nodes} onSelectNode={onSelectNode} />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={toggleTheme}>
              {isDark ? <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" asChild>
              <a href="https://github.com/xandeum" target="_blank" rel="noopener noreferrer">
                <Github className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" asChild>
              <a href="https://docs.xandeum.com" target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </a>
            </Button>
          </div>

          {lastUpdated && (
            <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-md border border-border/50">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Next refresh in {timeLeft}s</span>
              </div>
              <div className="w-px h-3 bg-border/50 mx-1" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-1.5 md:gap-2 h-8 md:h-9 text-xs md:text-sm bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all px-2 md:px-3"
            >
              <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={toggleTheme}>
                      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      Theme
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                      <a href="https://github.com/xandeum" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  </div>
                </div>

                {lastUpdated && (
                  <div className="px-2 py-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      Next refresh in {timeLeft}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last Updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
