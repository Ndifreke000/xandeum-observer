import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import type { PNode } from '@/types/pnode';
import { Card } from '@/components/ui/card';

interface GlobeVisualizationProps {
    nodes: PNode[];
}

const GlobeVisualization = ({ nodes }: GlobeVisualizationProps) => {
    const globeEl = useRef<any>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [geolocatedNodes, setGeolocatedNodes] = useState<PNode[]>([]);

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
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
        }
    }, [nodes]);

    return (
        <Card ref={containerRef} className="h-[300px] md:h-[500px] w-full overflow-hidden bg-black/40 backdrop-blur-md border-white/10 relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 className="text-xl font-bold text-white">Live Network Map</h2>
                <p className="text-sm text-gray-400">
                    {geolocatedNodes.length} pNodes Geolocated
                </p>
            </div>

            {dimensions.width > 0 && (
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
            )}
        </Card>
    );
};

export default GlobeVisualization;
