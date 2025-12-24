import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import type { PNode } from '@/types/pnode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Zap } from 'lucide-react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GlobeVisualizationProps {
    nodes: PNode[];
}

const GlobeVisualization = ({ nodes }: GlobeVisualizationProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globeEl = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [geolocatedNodes, setGeolocatedNodes] = useState<PNode[]>([]);
    const [isLowPerformance, setIsLowPerformance] = useState(false);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Default to 3D on mobile (2D map doesn't work well on some mobile devices)
        // Users can still switch to 2D if they prefer
        setIsLowPerformance(false);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Generate topology arcs (connect some nodes to simulate network flow)
    const arcData = geolocatedNodes.length > 1 ? geolocatedNodes.slice(0, 15).map((node, i) => {
        const nextNode = geolocatedNodes[(i + 1) % Math.min(geolocatedNodes.length, 15)];
        return {
            startLat: node.geo!.lat,
            startLng: node.geo!.lon,
            endLat: nextNode.geo!.lat,
            endLng: nextNode.geo!.lon,
            color: ['#3b82f6', '#8b5cf6', '#ec4899'][i % 3]
        };
    }) : [];

    useEffect(() => {
        // Filter nodes with valid geo data
        const validNodes = nodes.filter(n => n.geo && n.geo.lat !== 0 && n.geo.lon !== 0);
        setGeolocatedNodes(validNodes);

        // Auto-rotate
        if (globeEl.current && !isLowPerformance) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
        }
    }, [nodes, isLowPerformance]);

    return (
        <Card ref={containerRef} className="h-[300px] md:h-[500px] w-full overflow-hidden bg-black/40 backdrop-blur-md border-white/10 relative group">
            <div className="absolute top-3 md:top-4 left-3 md:left-4 z-10 pointer-events-none">
                <h2 className="text-base md:text-xl font-black tracking-tighter text-white flex items-center gap-1.5 md:gap-2">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                    <span className="hidden sm:inline">LIVE NETWORK MAP</span>
                    <span className="sm:hidden">NETWORK MAP</span>
                </h2>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest text-gray-400">
                    {geolocatedNodes.length} pNodes Geolocated
                </p>
            </div>

            <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10 flex gap-1.5 md:gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 md:h-8 px-1.5 md:px-2 text-[9px] md:text-[10px] gap-1 md:gap-1.5 backdrop-blur-md border-white/10 ${!isLowPerformance ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-black/40 text-gray-400'}`}
                    onClick={() => setIsLowPerformance(false)}
                >
                    <Monitor className="h-3 w-3" /> 
                    <span className="hidden sm:inline">3D GLOBE</span>
                    <span className="sm:hidden">3D</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-7 md:h-8 px-1.5 md:px-2 text-[9px] md:text-[10px] gap-1 md:gap-1.5 backdrop-blur-md border-white/10 ${isLowPerformance ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-black/40 text-gray-400'}`}
                    onClick={() => setIsLowPerformance(true)}
                >
                    <Smartphone className="h-3 w-3" /> 
                    <span className="hidden sm:inline">2D MAP</span>
                    <span className="sm:hidden">2D</span>
                </Button>
            </div>

            {dimensions.width > 0 && (
                !isLowPerformance ? (
                    <Globe
                        ref={globeEl}
                        width={dimensions.width}
                        height={dimensions.height}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                        pointsData={geolocatedNodes}
                        pointLat={(d: object) => (d as PNode).geo?.lat || 0}
                        pointLng={(d: object) => (d as PNode).geo?.lon || 0}
                        pointColor={(d: object) => (d as PNode).status === 'online' ? '#10b981' : '#f59e0b'}
                        pointAltitude={0.01}
                        pointRadius={0.4}
                        pointsMerge={false}

                        arcsData={arcData}
                        arcColor="color"
                        arcDashLength={0.4}
                        arcDashGap={2}
                        arcDashAnimateTime={2000}
                        arcStroke={0.2}

                        pointLabel={(d: object) => `
                            <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px; color: white; font-family: sans-serif; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px);">
                                <b style="color: #10b981;">${(d as PNode).ip}</b><br/>
                                <span style="font-size: 10px; color: #94a3b8;">${(d as PNode).geo?.city}, ${(d as PNode).geo?.country}</span><br/>
                                <span style="font-size: 10px; color: #94a3b8;">Uptime: ${(d as PNode).metrics.uptime.toFixed(1)}%</span>
                            </div>
                        `}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#00050a]">
                        <ComposableMap
                            projectionConfig={{ scale: 140 }}
                            width={dimensions.width}
                            height={dimensions.height}
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#111827"
                                            stroke="#1f2937"
                                            strokeWidth={0.5}
                                        />
                                    ))
                                }
                            </Geographies>
                            {geolocatedNodes.map((node, i) => (
                                <Marker key={i} coordinates={[node.geo!.lon, node.geo!.lat]}>
                                    <circle
                                        r={3}
                                        fill={node.status === 'online' ? '#10b981' : '#f59e0b'}
                                        className="animate-pulse"
                                    />
                                </Marker>
                            ))}
                        </ComposableMap>
                    </div>
                )
            )}
        </Card>
    );
};

export default GlobeVisualization;
