import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Activity, Network, FileCode, Clock } from "lucide-react";

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
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Block Nodes EDA
                        </h3>
                        <p className="text-muted-foreground">
                            The <strong>Block Nodes Exploratory Data Analysis (EDA)</strong> tool allows you to inspect the <strong>real-time status</strong> of individual nodes in the network.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Select a Node:</strong> Use the dropdown to search for and select any active pNode by its ID.</li>
                            <li><strong>Real-Time Identity:</strong> View the node's current IP, version, uptime, and active status directly from the network.</li>
                            <li><strong>Performance Signals:</strong> Check the node's current latency and health tier.</li>
                        </ul>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                            <strong>Note:</strong> Detailed historical metrics (Traffic, I/O, Peer Interactions) are currently unavailable as the network does not yet archive this data for individual nodes.
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-500" />
                            Historical Data
                        </h3>
                        <p className="text-muted-foreground">
                            To view the <strong>historical performance of the entire network</strong>, please visit the main dashboard.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Network History:</strong> Charts showing total nodes, storage, and online status over time are available on the home page.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Network className="h-5 w-5 text-green-500" />
                            Data Flow Visualization
                        </h3>
                        <p className="text-muted-foreground">
                            The <strong>Data Flow Visual</strong> provides a high-level view of how data moves across the Xandeum network.
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Traffic Patterns:</strong> See the volume of data being exchanged between nodes.</li>
                            <li><strong>Network Topology:</strong> Visualize the connections and density of the pNode network.</li>
                        </ul>
                    </section>

                    <section className="bg-muted/50 p-4 rounded-lg border border-border/50">
                        <h3 className="font-semibold mb-2">New to Xandeum?</h3>
                        <p className="text-sm text-muted-foreground">
                            Xandeum is a storage-enabled blockchain. <strong>pNodes</strong> (Physical Nodes) are the backbone of this network, providing both consensus and decentralized storage. This dashboard helps you monitor the health, stability, and performance of these critical infrastructure components.
                        </p>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
