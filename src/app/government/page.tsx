'use client';

import React, { useState } from 'react';
import { useSettings } from '../../lib/settings-context';
import { simulateInterventions, estimateLST, calculateWBGT } from '../../lib/physics-engine';
import { runCollaborativeWorkflow } from '../../lib/agents-orchestrator';
import GisMap from '../../components/gis-map';
import { 
  Building, 
  Sparkles, 
  Leaf, 
  Umbrella, 
  Layers, 
  Coins, 
  FileText,
  Play, 
  BookOpen, 
  Download, 
  Loader2 
} from 'lucide-react';

export default function GovernmentPortal() {
  const { currentCity, geminiApiKey } = useSettings();
  
  // Sandbox inputs state
  const [treePlantedCount, setTreePlantedCount] = useState(2500);
  const [coolRoofAreaM2, setCoolRoofAreaM2] = useState(80000);
  const [greenRoofAreaM2, setGreenRoofAreaM2] = useState(20000);
  const [waterBodyAreaM2, setWaterBodyAreaM2] = useState(5000);

  // Policy compilation states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<any[]>([]);

  // Calculate thermodynamic metrics
  const baseParams = currentCity.baseParams;
  const lstRes = estimateLST(baseParams);
  const wbgtRes = calculateWBGT(baseParams.airTemp, baseParams.relativeHumidity, baseParams.solarRad, baseParams.windSpeed);

  // Simulate interventions
  const simResult = simulateInterventions(
    baseParams, 
    { treePlantedCount, coolRoofAreaM2, greenRoofAreaM2, waterBodyAreaM2 }, 
    1000000
  );

  const handleCompilePolicy = async () => {
    setIsCompiling(true);
    setCompiledReport(null);
    setAgentLogs([]);

    try {
      // Run the collaborative agent flow
      const result = await runCollaborativeWorkflow(
        'cooling-master-plan',
        currentCity.name,
        {
          ...baseParams,
          ndvi: baseParams.ndvi + (treePlantedCount * 25 / 1000000) * 0.4,
          albedo: baseParams.albedo + (coolRoofAreaM2 / 1000000) * 0.6
        },
        geminiApiKey
      );

      // Add a slight delay to simulate thinking logs nicely
      setTimeout(() => {
        setCompiledReport(result.report);
        setAgentLogs(result.logs);
        setIsCompiling(false);
      }, 1500);

    } catch (e) {
      console.error(e);
      setIsCompiling(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* Header stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Surface LST anomaly</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-rose-500">+{Math.round((lstRes.lst - baseParams.airTemp) * 10) / 10}°C</span>
            <span className="text-xs text-slate-400">UHI intensity</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Wet bulb stress</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-cyan-400">{wbgtRes.wetBulb}°C</span>
            <span className="text-xs text-slate-400">({wbgtRes.riskLevel} Risk)</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Zoning vulnerability</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-amber-500">{currentCity.vulnerabilityIndex}/100</span>
            <span className="text-xs text-slate-400">Demographic exposure</span>
          </div>
        </div>
      </div>

      {/* Split Planner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sandbox and Map (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col gap-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                Thermodynamic Mitigation Sandbox
              </h3>
              <p className="text-xs text-slate-400">Simulate parameters and watch map thermals and costs adapt dynamically</p>
            </div>

            {/* Inputs sliders grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-800 pb-5">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Plant Canopy Shade Trees</span>
                  <span className="font-bold text-emerald-400">{treePlantedCount.toLocaleString()} trees</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={treePlantedCount}
                  onChange={(e) => setTreePlantedCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-[9px] text-slate-500">Estimates mature coverage: {(treePlantedCount * 25 / 10000).toFixed(1)} ha</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Cool Roof Retrofitting (Albedo $\ge$ 0.75)</span>
                  <span className="font-bold text-cyan-400">{coolRoofAreaM2.toLocaleString()} m²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="10000"
                  value={coolRoofAreaM2}
                  onChange={(e) => setCoolRoofAreaM2(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[9px] text-slate-500">Targets low-income wards and industrial warehouses</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Rooftop Vegetation (Green Roofs)</span>
                  <span className="font-bold text-teal-400">{greenRoofAreaM2.toLocaleString()} m²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={greenRoofAreaM2}
                  onChange={(e) => setGreenRoofAreaM2(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-[9px] text-slate-500">Combats runoff and offers high buildings micro-cooling</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Water Body Retention Plazas</span>
                  <span className="font-bold text-blue-400">{waterBodyAreaM2.toLocaleString()} m²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="1000"
                  value={waterBodyAreaM2}
                  onChange={(e) => setWaterBodyAreaM2(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[9px] text-slate-500">Fosters micro-scale evaporative cooling circulation</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">LST reduction</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">-{simResult.expectedLstReduction}°C</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Surface LST: {simResult.newLst}°C</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">Air Temp cooling</span>
                <p className="text-xl font-extrabold text-cyan-400 mt-1">-{simResult.expectedAirTempReduction}°C</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Air Temp: {simResult.newAirTemp}°C</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">Carbon Capture</span>
                <p className="text-xl font-extrabold text-slate-200 mt-1">{simResult.carbonSequestrationKgPerYear.toLocaleString()} kg</p>
                <p className="text-[9px] text-slate-500 mt-0.5">CO2/year absorbed</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-semibold">Cost Estimate</span>
                <p className="text-xl font-extrabold text-slate-200 mt-1">${simResult.estimatedCostUsd.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Capital expenditure</p>
              </div>
            </div>

            {/* Feasibility score and spatial placement recommendations */}
            <div className="flex flex-col sm:flex-row gap-6 mt-1.5">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Implementation Feasibility</span>
                  <span className="font-bold text-slate-200">{simResult.feasibilityScore}/100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      simResult.feasibilityScore > 75 
                        ? 'bg-emerald-500' 
                        : simResult.feasibilityScore > 50 
                        ? 'bg-cyan-400' 
                        : 'bg-rose-500'
                    }`} 
                    style={{ width: `${simResult.feasibilityScore}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] mt-1">
                  <span className="text-slate-500">Cost & complexity scale</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase ${getPriorityColor(simResult.implementationPriority)}`}>
                    Priority: {simResult.implementationPriority}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-cyan-400">Spatial Placement Guidelines:</span>
                <p className="mt-1 leading-relaxed text-[11px]">{simResult.spatialPlacementRecommendation}</p>
              </div>
            </div>
          </div>

          {/* GIS map update linking */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800/80 h-[400px]">
            <GisMap 
              city={currentCity} 
              coolingInterventions={{ treePlantedCount, coolRoofAreaM2, greenRoofAreaM2, waterBodyAreaM2 }} 
            />
          </div>
        </div>

        {/* Right Column: Policy Compiler (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col gap-4 h-full min-h-[600px]">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">Policy Compiler</h3>
                  <p className="text-[10px] text-slate-400">Multi-agent advisory drafter</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesize scientific telemetry and sandbox simulations into structured climate policies. Clicking "Compile Policy" triggers a collaborative debate log between the specialized agents.
            </p>

            <button
              onClick={handleCompilePolicy}
              disabled={isCompiling}
              className="w-full py-2.5 glow-btn-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
            >
              {isCompiling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Compiling Report...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Compile Adaptation Policy
                </>
              )}
            </button>

            {/* Agent collaborative logs or Document Viewer */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {isCompiling && (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 border border-slate-800/60 rounded-xl bg-slate-950/20 p-4">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-cyan-400 absolute top-0 -right-2 animate-bounce" />
                  </div>
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300">Agents Cooperating...</p>
                    <p className="text-[10px] text-slate-500 mt-1">Data Validation Agent &rarr; Urban Heat Agent &rarr; Morphology Agent &rarr; Government Planning Agent</p>
                  </div>
                </div>
              )}

              {!isCompiling && !compiledReport && (
                <div className="flex-1 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
                  <BookOpen className="w-8 h-8 text-slate-600 mb-2" />
                  No Compiled Policy Active.
                  <p className="text-[10px] text-slate-600 mt-1">Configure parameters in the sandbox and trigger policy compilation.</p>
                </div>
              )}

              {!isCompiling && compiledReport && (
                <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Document Compiled
                    </span>
                    <button 
                      onClick={() => {
                        const blob = new Blob([compiledReport], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${currentCity.id}-cooling-master-plan.md`;
                        a.click();
                      }}
                      className="p-1.5 rounded bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Download markdown report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Markdown viewer */}
                  <div className="flex-1 overflow-y-auto bg-slate-950/60 border border-slate-900 rounded-xl p-4 text-[11px] leading-relaxed text-slate-300 font-sans select-text max-h-[350px]">
                    {compiledReport.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-sm font-bold text-white border-b border-slate-800 pb-1.5 mb-2.5 mt-1">{line.replace('# ', '')}</h1>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-xs font-bold text-cyan-400 mt-3.5 mb-1.5">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('* ')) {
                        return <li key={idx} className="ml-3.5 list-disc mt-0.5">{line.replace('* ', '')}</li>;
                      }
                      return <p key={idx} className={line.trim() ? 'mt-1.5' : ''}>{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
