'use client';

import React, { useState, useEffect } from 'react';
import { CityData, CoolingShelter } from '../lib/demo-data';
import { estimateLST } from '../lib/physics-engine';
import { Map, Layers, Compass, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface GisMapProps {
  city: CityData;
  selectedShelter?: CoolingShelter | null;
  onSelectShelter?: (shelter: CoolingShelter) => void;
  coolingInterventions?: {
    treePlantedCount: number;
    coolRoofAreaM2: number;
    greenRoofAreaM2: number;
    waterBodyAreaM2: number;
  };
}

export default function GisMap({ 
  city, 
  selectedShelter, 
  onSelectShelter,
  coolingInterventions 
}: GisMapProps) {
  const [activeLayer, setActiveLayer] = useState<'thermal' | 'ndvi' | 'satellite'>('thermal');
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; lst: number; ndvi: number; density: number } | null>(null);
  
  // Calculate simulated parameters
  const trees = coolingInterventions?.treePlantedCount || 0;
  const coolRoofs = coolingInterventions?.coolRoofAreaM2 || 0;
  const water = coolingInterventions?.waterBodyAreaM2 || 0;

  // Generate 12x12 grid representing spatial segments of the city
  const gridCells = [];
  const gridSize = 8;
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Calculate local variations based on x, y coordinates
      // Central areas have higher density, outskirts have higher vegetation
      const centerDist = Math.sqrt(Math.pow(x - (gridSize - 1) / 2, 2) + Math.pow(y - (gridSize - 1) / 2, 2));
      const normalizedCenterDist = centerDist / (Math.sqrt(2) * (gridSize - 1) / 2);

      let localDensity = Math.round(city.baseParams.buildingDensity * (1.1 - normalizedCenterDist * 0.3));
      localDensity = Math.min(Math.max(localDensity - (water > 0 ? 5 : 0), 10), 95);

      let localNdvi = city.baseParams.ndvi * (normalizedCenterDist * 0.7 + 0.3);
      if (trees > 0) localNdvi += (trees / 5000) * 0.15;
      localNdvi = Math.min(Math.max(localNdvi, 0.05), 0.85);

      let localAlbedo = city.baseParams.albedo;
      if (coolRoofs > 0) localAlbedo = Math.min(localAlbedo + (coolRoofs / 100000) * 0.25, 0.65);

      const localParams = {
        ...city.baseParams,
        buildingDensity: localDensity,
        ndvi: localNdvi,
        albedo: localAlbedo
      };

      const lstResult = estimateLST(localParams);
      gridCells.push({ x, y, lst: lstResult.lst, ndvi: localNdvi, density: localDensity });
    }
  }

  // Determine heat cell color mapping
  const getCellColor = (lst: number, ndvi: number, density: number) => {
    if (activeLayer === 'thermal') {
      // Scale from green/blue to deep red
      if (lst > 45) return 'rgba(239, 68, 68, 0.75)'; // deep red
      if (lst > 40) return 'rgba(249, 115, 22, 0.7)'; // orange
      if (lst > 35) return 'rgba(245, 158, 11, 0.65)'; // amber
      if (lst > 30) return 'rgba(234, 179, 8, 0.55)'; // yellow
      return 'rgba(16, 185, 129, 0.45)'; // green
    } else if (activeLayer === 'ndvi') {
      // Scale from light brown to deep green
      if (ndvi > 0.6) return 'rgba(4, 120, 87, 0.8)'; // forest green
      if (ndvi > 0.4) return 'rgba(16, 185, 129, 0.65)'; // emerald
      if (ndvi > 0.2) return 'rgba(110, 231, 183, 0.5)'; // mint
      return 'rgba(217, 119, 6, 0.4)'; // dry grass brown
    } else {
      // Satellite layout colors (urban concrete grid view)
      if (density > 75) return 'rgba(100, 116, 139, 0.75)'; // dark concrete slate
      if (density > 50) return 'rgba(148, 163, 184, 0.65)'; // medium slate
      return 'rgba(71, 85, 105, 0.55)'; // light slate
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Map Control bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">Geospatial Overlay</span>
        </div>
        
        {/* Layers toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveLayer('thermal')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeLayer === 'thermal'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thermal Heatmap
          </button>
          <button
            onClick={() => setActiveLayer('ndvi')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeLayer === 'ndvi'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NDVI (Greenery)
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeLayer === 'satellite'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Urban density
          </button>
        </div>
      </div>

      {/* Map Grid Canvas */}
      <div className="relative flex-1 min-h-[350px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
        {/* Water canal decorative lines */}
        <div className="absolute inset-x-0 top-1/2 h-8 bg-blue-950/20 border-y border-blue-900/10 pointer-events-none flex items-center pl-6">
          <span className="text-[9px] text-blue-500/30 uppercase tracking-widest font-semibold">Cynthia River Channel</span>
        </div>

        {/* Spatial Grid representation */}
        <div className="grid grid-cols-8 gap-1.5 w-full max-w-[400px] aspect-square relative z-10">
          {gridCells.map((cell, idx) => (
            <div
              key={idx}
              className="rounded transition-all cursor-pointer relative group border border-slate-900/10"
              style={{ backgroundColor: getCellColor(cell.lst, cell.ndvi, cell.density) }}
              onMouseEnter={() => setHoveredNode(cell)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Highlight selector */}
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/50 rounded transition-all" />
            </div>
          ))}

          {/* Shelter Pins Overlays */}
          {city.coolingShelters.map((shelter) => {
            // Map lat/lng coordinates to our grid roughly
            // Lat ranges 33.39 to 33.46 -> maps to grid indices
            const latFraction = (shelter.lat - city.coords.lat + 0.05) / 0.1;
            const lngFraction = (shelter.lng - city.coords.lng + 0.05) / 0.1;
            
            const gridX = Math.min(Math.max(Math.floor(lngFraction * gridSize), 1), gridSize - 2);
            const gridY = Math.min(Math.max(Math.floor(latFraction * gridSize), 1), gridSize - 2);

            const isSelected = selectedShelter?.id === shelter.id;

            return (
              <div
                key={shelter.id}
                onClick={() => onSelectShelter?.(shelter)}
                className="absolute z-20 transition-all cursor-pointer -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((gridX + 0.5) / gridSize) * 100}%`,
                  top: `${((gridY + 0.5) / gridSize) * 100}%`
                }}
              >
                <div className={`p-1 rounded-full border shadow-lg transition-all flex items-center justify-center ${
                  isSelected 
                    ? 'bg-cyan-500 text-white scale-125 border-white ring-4 ring-cyan-500/25' 
                    : 'bg-[#0f172a] text-cyan-400 border-cyan-500 hover:scale-115'
                }`}>
                  <Compass className="w-3.5 h-3.5" />
                </div>
                {/* Shelter Tag */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-200 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  {shelter.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating HUD info */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 z-30 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-col gap-1 backdrop-blur-md pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-100 max-w-[200px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
              <span className="font-bold text-slate-300">Sector [{hoveredNode.x}, {hoveredNode.y}]</span>
              <Eye className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="flex justify-between gap-4 text-slate-400">Surface LST: <span className="font-bold text-rose-400">{hoveredNode.lst}°C</span></p>
            <p className="flex justify-between gap-4 text-slate-400">Greenery Index: <span className="font-bold text-emerald-400">{Math.round(hoveredNode.ndvi * 100)}%</span></p>
            <p className="flex justify-between gap-4 text-slate-400">Bldg Density: <span className="font-bold text-slate-300">{hoveredNode.density}%</span></p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute right-4 bottom-4 z-20 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[9px] flex flex-col gap-1.5 backdrop-blur-md">
          <span className="font-bold text-slate-400 uppercase tracking-wider">Legend</span>
          {activeLayer === 'thermal' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-rose-500" /> Critical (&gt;45°C)
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-orange-500" /> High (40°C - 45°C)
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-amber-500" /> Moderate (35°C - 40°C)
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Stable (&lt;35°C)
              </div>
            </div>
          )}
          {activeLayer === 'ndvi' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-emerald-700" /> Dense Canopy
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Grass / Shrubs
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-amber-600" /> Sparse Cover
              </div>
            </div>
          )}
          {activeLayer === 'satellite' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-slate-500" /> High Density
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-slate-600" /> Medium Density
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <div className="w-2.5 h-2.5 rounded bg-slate-700" /> Low Density
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
