import { Button } from '@/components/ui/button';
import { RefreshCw, Menu, FileCode, Network, Search, Sun, Moon, Github, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
}

export const Header = ({ onRefresh, isLoading, lastUpdated }: HeaderProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to dark for "deep space" theme

  const isActive = (path: string) => location.pathname === path;

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

      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={location.pathname.startsWith('/contracts') ? "secondary" : "ghost"} className="gap-2">
              <FileCode className="w-4 h-4" />
              Contracts
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link to="/contracts/eda">
              <DropdownMenuItem className="cursor-pointer">
                Contract EDA
              </DropdownMenuItem>
            </Link>
            <Link to="/contracts/data-flow">
              <DropdownMenuItem className="cursor-pointer">
                Data Flow Visual
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Contract Links */}
      <div className="md:hidden space-y-1 pl-4 border-l-2 border-border/50 ml-2">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-4">Contracts</div>
        <Link to="/contracts/eda">
          <Button
            variant={isActive('/contracts/eda') ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 text-sm h-9"
            onClick={() => setIsOpen(false)}
          >
            EDA Dashboard
          </Button>
        </Link>
        <Link to="/contracts/data-flow">
          <Button
            variant={isActive('/contracts/data-flow') ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 text-sm h-9"
            onClick={() => setIsOpen(false)}
          >
            Data Flow
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <img src="/logo.png" alt="Xandeum Logo" className="h-8 w-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Xandeum
              </span>
              <span className="text-[10px] font-medium text-muted-foreground leading-none">
                Network Observer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button variant={isActive('/') ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Network className="w-4 h-4" />
                pNodes
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={location.pathname.startsWith('/contracts') ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <FileCode className="w-4 h-4" />
                  Contracts
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <Link to="/contracts/eda">
                  <DropdownMenuItem className="cursor-pointer">
                    Contract EDA
                  </DropdownMenuItem>
                </Link>
                <Link to="/contracts/data-flow">
                  <DropdownMenuItem className="cursor-pointer">
                    Data Flow Visual
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Center Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pNodes, contracts, or transactions..."
              className="w-full bg-background/50 pl-9 h-9 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <a href="https://github.com/xandeum" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <a href="https://docs.xandeum.com" target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {lastUpdated && (
            <span className="hidden xl:inline-flex text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/50">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2 h-9 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] pr-0">
              <div className="flex flex-col gap-6 mt-6 pr-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">Navigation</h3>
                  <NavLinks />
                </div>

                <div className="px-2">
                  <div className="relative w-full mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full bg-background/50 pl-9 h-9"
                    />
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
                  <div className="px-2 py-4 border-t">
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
