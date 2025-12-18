import React, { useEffect, useState } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { PNode } from '@/types/pnode';
import { Search, Server, Trophy, Activity } from 'lucide-react';

interface CommandMenuProps {
    nodes: PNode[];
    onSelectNode: (node: PNode) => void;
}

export function CommandMenu({ nodes, onSelectNode }: CommandMenuProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative inline-flex items-center justify-start px-3 py-1.5 text-sm font-medium transition-colors border rounded-md bg-background/50 border-border/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full max-w-xs lg:max-w-sm"
            >
                <Search className="w-4 h-4 mr-2" />
                <span>Search nodes...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type an IP or Node ID..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Active Nodes">
                        {nodes.filter(n => n.status === 'online').slice(0, 10).map((node) => (
                            <CommandItem
                                key={node.id}
                                onSelect={() => {
                                    onSelectNode(node);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Server className="w-4 h-4 text-green-500" />
                                <span className="font-mono">{node.ip}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{node.id}</span>
                                {node.rank && (
                                    <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-primary">
                                        <Trophy className="w-3 h-3" />
                                        #{node.rank}
                                    </div>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup heading="Other Nodes">
                        {nodes.filter(n => n.status !== 'online').slice(0, 5).map((node) => (
                            <CommandItem
                                key={node.id}
                                onSelect={() => {
                                    onSelectNode(node);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Activity className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono">{node.ip}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{node.id}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
