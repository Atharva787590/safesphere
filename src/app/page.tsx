'use client';

import React from 'react';
import { useSettings } from '../lib/settings-context';
import { estimateLST, calculateWBGT } from '../lib/physics-engine';
import { CITIES_DATA, MOCK_DISASTER_REPORTS } from '../lib/demo-data';
import { AGENTS_LIST } from '../lib/agents-orchestrator';
import { 
  ThermometerSun, 
  ShieldAlert, 
  MapPin, 
  ArrowRight,
  TrendingUp, 
  Layers, 
  Radio, 
  Sparkles,
  Users,
  Building,
  HeartHandshake
} from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const { currentCity, userRole } = useSettings();

  // Run thermodynamic formulas on current city
  const lstRes = estimateLST(currentCity.baseParams);
  const wbgtRes = calculateWBGT(
    currentCity.baseParams.airTemp,
    currentCity.baseParams.relativeHumidity,
    currentCity.baseParams.solarRad,
    currentCity.baseParams.windSpeed
  );

  // Active agents count
  const onlineAgents = AGENTS_LIST.filter(a => a.status !== 'Offline').length;

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
        <div className="flex-1 flex flex-col gap-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Agents for Good Track
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            SafeSphere Platform
          </h1>
          <p className="text-sm text-zinc-650 dark:text-zinc-300 max-w-2xl">
            AI-Powered Urban Heat Intelligence, Disaster Resilience, Climate Adaptation and Public Safety Platform. Facilitating safe, resilient municipal development using advanced multi-agent cooperation systems.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link 
              href="/citizen" 
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" /> Citizen Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/government" 
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-all flex items-center gap-1.5"
            >
              <Building className="w-4 h-4" /> Government Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="flex flex-row md:flex-col gap-6 relative z-10 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-6 md:pt-0 md:pl-8">
          <div className="flex-1 md:flex-none">
            <span className="text-[10px] text-zinc-555 dark:text-zinc-550 font-semibold uppercase tracking-wider">Multi-Agent Grid</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{onlineAgents}</span>
              <span className="text-xs text-zinc-500">/ {AGENTS_LIST.length} Online</span>
            </div>
          </div>
          <div className="flex-1 md:flex-none">
            <span className="text-[10px] text-zinc-555 dark:text-zinc-550 font-semibold uppercase tracking-wider">Demo Cities</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{CITIES_DATA.length}</span>
              <span className="text-xs text-zinc-550 dark:text-zinc-500">Zones Ingested</span>
            </div>
          </div>
          <div className="flex-1 md:flex-none">
            <span className="text-[10px] text-zinc-555 dark:text-zinc-550 font-semibold uppercase tracking-wider">Role Setting</span>
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-1 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Local Thermodynamic Telemetry */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-6 border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-white">{currentCity.name} Telemetry</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Physics-informed local boundary metrics</p>
                </div>
              </div>
              {currentCity.disasterAlert && currentCity.disasterAlert.type !== 'None' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {currentCity.disasterAlert.type}
                </span>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Air Temperature</span>
                <p className="text-2xl font-bold text-zinc-850 dark:text-zinc-200 mt-1">{currentCity.baseParams.airTemp}°C</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Surface LST</span>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{lstRes.lst}°C</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Wet Bulb Globe</span>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{wbgtRes.wbgt}°C</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Heat Index</span>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mt-1">
                  {Math.round(currentCity.baseParams.airTemp * 1.1)}°C
                </p>
              </div>
            </div>

            {/* Physical factors bar charts */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">Surface Material Contributors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Vegetation Canopy (NDVI: {currentCity.baseParams.ndvi})</span>
                    <span className="text-emerald-600 dark:text-emerald-450 font-semibold">{Math.round(currentCity.baseParams.ndvi * 100)}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(currentCity.baseParams.ndvi * 100, 0)}%` }} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Surface Albedo (Reflectance: {currentCity.baseParams.albedo})</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{Math.round(currentCity.baseParams.albedo * 100)}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-450 dark:bg-cyan-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentCity.baseParams.albedo * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Urban Building Density</span>
                    <span className="text-rose-600 dark:text-rose-450 font-semibold">{currentCity.baseParams.buildingDensity}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentCity.baseParams.buildingDensity}%` }} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>Relative Humidity</span>
                    <span className="text-blue-600 dark:text-blue-450 font-semibold">{currentCity.baseParams.relativeHumidity}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${currentCity.baseParams.relativeHumidity}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific explanation alert */}
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 mt-2">
              <ThermometerSun className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Explainability Agent Diagnostics: </span>
                Absorbed solar radiation is high ({lstRes.absorbedRadiationWm2} W/m²) due to low albedo of {currentCity.baseParams.albedo}. Combined with a high urban layout trapping multiplier ({Math.round((1.0 + (currentCity.baseParams.buildingDensity/100)*(currentCity.baseParams.buildingHeight/100)*0.8)*100)/100}), this traps heat, resulting in an expected surface temperature anomaly of {Math.round((lstRes.lst - currentCity.baseParams.airTemp)*10)/10}°C.
              </div>
            </div>
          </div>

          {/* Core Portal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/citizen" className="glass-card rounded-xl p-5 flex flex-col gap-3 group">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400 w-fit group-hover:bg-emerald-500/20 transition-all">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Citizen Portal <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Check local cooling shelters, emergency hotlines, and consult the Citizen Support Assistant for localized health advice.
              </p>
            </Link>

            <Link href="/government" className="glass-card rounded-xl p-5 flex flex-col gap-3 group">
              <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-cyan-400 w-fit group-hover:bg-cyan-500/20 transition-all">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base flex items-center gap-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Government Planning <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Run thermodynamic microclimate simulations, optimize green space allocations, and draft policy cool-roof mandates.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Column: Multi-Agent status registry */}
        <div className="flex flex-col gap-6">
          {/* Active Disaster Statuses */}
          <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
              Global Resilience Alerts
            </h3>
            <div className="flex flex-col gap-3">
              {MOCK_DISASTER_REPORTS.map((report) => (
                <div key={report.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/60 text-xs flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{report.cityName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[9px]">
                      {report.intensity} {report.type}
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">{report.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Agents Checklist */}
          <div className="glass-panel rounded-xl p-5 border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                Active Agent System
              </h3>
              <Link href="/agents" className="text-[10px] text-emerald-650 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5">
                Terminal <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
              {AGENTS_LIST.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">{agent.name}</p>
                      <p className="text-[9px] text-zinc-500 dark:text-zinc-400">{agent.role}</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[9px] text-zinc-500 dark:text-zinc-400 font-medium capitalize">
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
