'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CityData, CoolingShelter } from '../lib/demo-data';
import { estimateLST } from '../lib/physics-engine';
import { Map, Eye, Compass, Info } from 'lucide-react';

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
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'terrain' | 'streets'>('satellite');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const heatDomeRef = useRef<any>(null);
  
  // Calculate simulated parameters
  const trees = coolingInterventions?.treePlantedCount || 0;
  const coolRoofs = coolingInterventions?.coolRoofAreaM2 || 0;
  const water = coolingInterventions?.waterBodyAreaM2 || 0;

  const currentLst = estimateLST({
    ...city.baseParams,
    ndvi: Math.min(city.baseParams.ndvi + (trees * 25 / 1000000) * 0.4, 0.85),
    albedo: Math.min(city.baseParams.albedo + (coolRoofs / 1000000) * 0.6, 0.6)
  }).lst;

  // Load Leaflet dynamically via CDN to ensure SSR compatibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if leaflet is already loaded
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // 1. Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // 2. Add Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up tags if needed
      try {
        document.head.removeChild(link);
        document.head.removeChild(script);
      } catch (e) {}
    };
  }, []);

  // Initialize and update Map instance
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Destroy map if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [city.coords.lat, city.coords.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });
    mapRef.current = map;

    // Add clean zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize markers group
    markerGroupRef.current = L.layerGroup().addTo(map);

    // Add Heat Bubble overlay circle
    // Color and opacity scale with surface temperature LST
    const getHeatColor = (temp: number) => {
      if (temp > 44) return '#ef4444'; // deep red
      if (temp > 39) return '#f97316'; // orange
      if (temp > 34) return '#f59e0b'; // amber
      return '#10b981'; // emerald green
    };

    const heatColor = getHeatColor(currentLst);
    const heatOpacity = Math.min(Math.max((currentLst - 25) / 25, 0.15), 0.7);

    heatDomeRef.current = L.circle([city.coords.lat, city.coords.lng], {
      color: heatColor,
      fillColor: heatColor,
      fillOpacity: heatOpacity,
      radius: 1800, // 1.8km radius representing Urban Heat Island core
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);

    // Bind tooltip to heat dome
    heatDomeRef.current.bindTooltip(
      `Urban Heat Island Core (Simulated LST: ${currentLst}°C)`,
      { permanent: false, direction: 'top' }
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, city.id]);

  // Update Base Layer Tile when activeLayer state changes
  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Find and remove existing tile layer
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';

    if (activeLayer === 'satellite') {
      // Esri World Imagery Satellite Tiles
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    } else if (activeLayer === 'terrain') {
      // OpenTopoMap Terrain Relief Tiles
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap';
    } else {
      // CartoDB Voyager Streets Tiles
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{y}/{x}{r}.png';
      attribution = '&copy; CartoDB';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution
    }).addTo(mapRef.current);

  }, [leafletLoaded, activeLayer, city.id]);

  // Update Markers and Popups when shelters, city, or selections change
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !markerGroupRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Clear previous markers
    markerGroupRef.current.clearLayers();

    // Map markers
    city.coolingShelters.forEach((shelter) => {
      const isSelected = selectedShelter?.id === shelter.id;

      // Custom marker icon using simple divIcon for high responsiveness
      const icon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: ${isSelected ? '#06b6d4' : '#1e293b'};
          border: 2px solid ${isSelected ? '#ffffff' : '#06b6d4'};
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${isSelected ? '#ffffff' : '#06b6d4'};
          transition: all 0.2s ease-in-out;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([shelter.lat, shelter.lng], { icon })
        .addTo(markerGroupRef.current);

      // Popup content
      const popupHtml = `
        <div style="font-family: var(--font-sans); padding: 2px; min-width: 140px; color: #1e293b;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 11px;">${shelter.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 9px; color: #64748b;">${shelter.address}</p>
          <div style="display: flex; justify-between; font-size: 9px; font-weight: 600; margin-bottom: 2px;">
            <span>Occupancy:</span>
            <span style="color: ${shelter.status === 'Full' ? '#ef4444' : '#06b6d4'}; margin-left: 4px;">${shelter.occupied} / ${shelter.capacity}</span>
          </div>
          <div style="font-size: 9px; font-weight: 600;">
            <span>Phone:</span> <span style="font-weight: 500;">${shelter.contact}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      marker.on('click', () => {
        onSelectShelter?.(shelter);
        marker.openPopup();
      });

      // Keep popup open if selected
      if (isSelected) {
        setTimeout(() => marker.openPopup(), 100);
      }
    });

  }, [leafletLoaded, city.coolingShelters, selectedShelter, city.id]);

  // Update Heat Bubble dynamically when simulation values change (LST updates)
  useEffect(() => {
    if (!leafletLoaded || !heatDomeRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const getHeatColor = (temp: number) => {
      if (temp > 44) return '#ef4444'; // deep red
      if (temp > 39) return '#f97316'; // orange
      if (temp > 34) return '#f59e0b'; // amber
      return '#10b981'; // emerald green
    };

    const heatColor = getHeatColor(currentLst);
    const heatOpacity = Math.min(Math.max((currentLst - 25) / 25, 0.15), 0.7);

    // Update style dynamically without re-initializing
    heatDomeRef.current.setStyle({
      color: heatColor,
      fillColor: heatColor,
      fillOpacity: heatOpacity
    });

    // Update tooltip content
    heatDomeRef.current.setTooltipContent(`Urban Heat Island Core (Simulated LST: ${currentLst}°C)`);

  }, [leafletLoaded, currentLst]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Map Control Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300">Live Satellite GIS Viewer</span>
        </div>
        
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeLayer === 'satellite'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite View
          </button>
          <button
            onClick={() => setActiveLayer('terrain')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeLayer === 'terrain'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain View
          </button>
          <button
            onClick={() => setActiveLayer('streets')}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              activeLayer === 'streets'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Street Map
          </button>
        </div>
      </div>

      {/* Map Element */}
      <div className="relative flex-1 min-h-[350px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-500 gap-2.5 z-30 bg-[#090d16]">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Loading satellite imagery and geospatial map controls...
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* HUD Info */}
        <div className="absolute bottom-4 left-4 z-20 p-3 rounded-lg bg-slate-900/90 border border-slate-850 text-xs flex flex-col gap-1 backdrop-blur-md pointer-events-none max-w-[220px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1 gap-4">
            <span className="font-bold text-slate-300">Resilience HUD</span>
            <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <p className="flex justify-between gap-4 text-slate-400 mt-0.5">UHI Core: <span className="font-bold text-rose-400">{currentLst}°C</span></p>
          <p className="flex justify-between gap-4 text-slate-400">Target Area: <span className="font-bold text-slate-200">${city.name} Center</span></p>
          <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 border-t border-slate-850 pt-1">
            <Info className="w-3 h-3 text-cyan-400" /> Click markers to inspect shelter capacities.
          </div>
        </div>
      </div>
    </div>
  );
}
