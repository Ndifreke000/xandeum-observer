import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Activity, Network, FileCode, Clock, Trophy, Search } from "lucide-react";

export function OverviewModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden md:inline">Overview</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" />
                        Xandeum Network Observer Guide
                    </DialogTitle>
                    <DialogDescription>
                        Welcome to the Xandeum Network Observer. Here's how to use the tools available to you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Leaderboard & Top Performers
                        </h3>
                        <p className="text-muted-foreground">
                            Xandeum rewards top-performing nodes. The <strong>Leaderboard</strong> highlights the top 3 nodes by rewards (credits).
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Rewards:</strong> Calculated based on uptime, storage contribution, and network participation.</li>
                            <li><strong>Rank:</strong> Nodes are ranked globally across the entire network.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <Search className="h-5 w-5 text-blue-500" />
                            Command Palette (⌘K)
                        </h3>
                        <p className="text-muted-foreground">
                            Navigate the network at light speed. Use the <strong>Command Palette</strong> to search for any node by IP or ID.
                        </p>
                        <div className="bg-muted p-3 rounded-md border border-border/50 flex items-center justify-between">
                            <span className="text-sm font-medium">Quick Search</span>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                                <span>⌘</span>K
                            </kbd>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <Activity className="h-5 w-5 text-green-500" />
                            Network Pulse & Stats
                        </h3>
                        <p className="text-muted-foreground">
                            The <strong>Network Pulse</strong> (pulsing green dot) indicates that you are viewing real-time data directly from the pRPC network.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Live Updates:</strong> Statistics and node statuses refresh every 10 seconds.</li>
                            <li><strong>Health Score:</strong> A weighted average of availability, stability, and responsiveness.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                            <FileCode className="h-5 w-5 text-purple-500" />
                            Node Inspector
                        </h3>
                        <p className="text-muted-foreground">
                            Deep dive into individual node performance and storage metrics.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Storage Analysis:</strong> View committed vs. used storage on the Xandeum filesystem.</li>
                            <li><strong>Raw Data:</strong> Access the direct JSON response from the pRPC backend for full transparency.</li>
                        </ul>
                    </section>

                    <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            Pro Tips
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>💡 <strong>Search Redirection:</strong> If you search for a contract address in the Node Inspector, we'll automatically suggest switching to the Contract EDA view.</li>
                            <li>💡 <strong>Mobile Friendly:</strong> The dashboard is fully responsive. On mobile, node details open in a full-screen overlay for better readability.</li>
                            <li>💡 <strong>Filtering:</strong> Use the "Status" filter in the registry to quickly find offline or unstable nodes for troubleshooting.</li>
                        </ul>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
