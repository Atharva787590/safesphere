'use client';

import React, { useState } from 'react';
import { useSettings } from '../../lib/settings-context';
import { AGENTS_LIST, querySingleAgent, AgentMetadata } from '../../lib/agents-orchestrator';
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Send, 
  RefreshCw,
  Play,
  Shield,
  Lightbulb,
  Radio,
  Building2,
  Lock,
  Search,
  Activity,
  CheckSquare
} from 'lucide-react';

export default function AgentsCommandPage() {
  const { currentCity, geminiApiKey } = useSettings();
  const [selectedAgent, setSelectedAgent] = useState<AgentMetadata>(AGENTS_LIST[0]);
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [agentAnswer, setAgentAnswer] = useState<string | null>(null);

  // Live telemetry packet logs stream
  const [logs, setLogs] = useState<any[]>([
    { id: '1', time: '10:42:01', source: 'Security Monitoring Agent', type: 'info', message: 'RBAC roles validated. Access tokens secure.' },
    { id: '2', time: '10:42:15', source: 'Data Validation Agent', type: 'success', message: 'Landsat 8 LST raster telemetry decrypted. Cloud density verified <1%.' },
    { id: '3', time: '10:42:30', source: 'Sensor Analytics Agent', type: 'info', message: 'Ingesting 12 telemetry streams. Callibration status: nominal.' },
    { id: '4', time: '10:43:05', source: 'Urban Heat Intelligence Agent', type: 'warning', message: `Surface thermal anomaly detected. LST calculated at ${Math.round((currentCity.baseParams.airTemp * 1.15) * 10) / 10}°C.` },
    { id: '5', time: '10:43:12', source: 'Urban Morphology Agent', type: 'info', message: 'Evaluating aspect ratio. Street canyons trapping heat in sector 4.' }
  ]);

  const handleQueryAgent = async () => {
    if (!queryInput.trim()) return;
    setIsQuerying(true);
    setAgentAnswer(null);

    try {
      const response = await querySingleAgent(
        selectedAgent.id,
        queryInput,
        currentCity.baseParams,
        geminiApiKey
      );
      setAgentAnswer(response);
    } catch (e) {
      setAgentAnswer('Communication timeout. Verify API config.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleInjectAlert = (alertType: 'Heatwave' | 'Flood' | 'Wildfire') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newLogs = [];

    if (alertType === 'Heatwave') {
      newLogs = [
        { id: Math.random().toString(), time, source: 'Sensor Analytics Agent', type: 'error', message: 'CRITICAL: Ambient air temp exceeded threshold of 42°C at Node-4B.' },
        { id: Math.random().toString(), time, source: 'Heat Forecasting Agent', type: 'warning', message: 'Forecast anomaly matches heatwave cycle. High pressure system stable for 72 hours.' },
        { id: Math.random().toString(), time, source: 'Explainability Agent', type: 'info', message: 'Physics multiplier: UHI trapped coefficient estimated at 1.48 in Roosevelt ward.' },
        { id: Math.random().toString(), time, source: 'Disaster Preparedness Agent', type: 'success', message: 'Cooling Center readiness list dispatched. Shelters 1, 2, 4 advised to prepare for surge.' },
        { id: Math.random().toString(), time, source: 'Government Planning Agent', type: 'info', message: 'Policy notice: Issuing construction labor suspension advisory for hours 12:00-16:00.' }
      ];
    } else if (alertType === 'Flood') {
      newLogs = [
        { id: Math.random().toString(), time, source: 'Data Validation Agent', type: 'warning', message: 'Sentinel-2 radar shows high surface reflectance in river flood plains.' },
        { id: Math.random().toString(), time, source: 'Disaster Risk Assessment Agent', type: 'error', message: 'Flash flood vulnerability index raised to 92 in low-elevation sectors.' },
        { id: Math.random().toString(), time, source: 'Emergency Response Agent', type: 'warning', message: 'Optimizing evacuation routes. Canal gate 4 opened to divert peak discharge.' }
      ];
    } else {
      newLogs = [
        { id: Math.random().toString(), time, source: 'Sensor Analytics Agent', type: 'warning', message: 'AQI particulate PM2.5 sensors exceed 250 ppm in buffer zone.' },
        { id: Math.random().toString(), time, source: 'Disaster Risk Assessment Agent', type: 'error', message: 'Wildfire exposure index critical in northwestern dry shrub sector.' },
        { id: Math.random().toString(), time, source: 'Emergency Response Agent', type: 'success', message: 'Dispatching warnings to rural-urban interface zones. Access route 2 cleared.' }
      ];
    }

    setLogs(prev => [...newLogs, ...prev]);
  };

  const getLogTypeStyle = (type: string) => {
    switch (type) {
      case 'error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'success': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      
      {/* Simulation events triggers */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-xs text-slate-200">Incident Telemetry Simulator</h3>
            <p className="text-[10px] text-slate-500">Inject hazards to watch agents coordinate in real-time</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleInjectAlert('Heatwave')}
            className="px-3 py-1.5 rounded-lg border border-orange-500/20 hover:border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 text-[10px] font-bold transition-all"
          >
            Inject Heatwave Alert
          </button>
          <button 
            onClick={() => handleInjectAlert('Flood')}
            className="px-3 py-1.5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 text-[10px] font-bold transition-all"
          >
            Inject Flood Alert
          </button>
          <button 
            onClick={() => handleInjectAlert('Wildfire')}
            className="px-3 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold transition-all"
          >
            Inject Wildfire Alert
          </button>
        </div>
      </div>

      {/* Main split dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Left pane: Agent Directory & Direct query (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col gap-4 flex-1">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                Agents Registry Console
              </h3>
              <p className="text-xs text-slate-400">Select an agent to inspect details or run direct inquiries</p>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-b border-slate-800 pb-4 max-h-[170px] overflow-y-auto pr-1">
              {AGENTS_LIST.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setAgentAnswer(null);
                  }}
                  className={`p-2 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                    selectedAgent.id === agent.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-[10px] truncate">{agent.name}</span>
                  <span className="text-[8px] opacity-75 truncate">{agent.role}</span>
                </button>
              ))}
            </div>

            {/* Selected Agent display metadata */}
            <div className="flex flex-col gap-3 bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">{selectedAgent.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] text-slate-400">
                  Status: {selectedAgent.status}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{selectedAgent.description}</p>
              
              {/* Instructions box */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[9px] text-slate-500 leading-relaxed font-mono">
                <span className="font-bold text-slate-400">System Instruction: </span>
                {selectedAgent.systemInstruction}
              </div>
            </div>

            {/* Direct query box */}
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Send query to ${selectedAgent.name}...`}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQueryAgent()}
                  className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                <button
                  onClick={handleQueryAgent}
                  disabled={isQuerying}
                  className="px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
                >
                  {isQuerying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="text-xs font-semibold hidden sm:inline">Query</span>
                </button>
              </div>

              {agentAnswer && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-100">
                  <span className="font-bold text-emerald-400">Response:</span>
                  <p className="mt-1.5">{agentAnswer}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Cooperative Communication Stream logs (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col gap-4 h-full min-h-[550px] overflow-hidden">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-200">Cooperative Stream</h3>
              </div>
              <button 
                onClick={() => setLogs(prev => [
                  { 
                    id: Math.random().toString(), 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                    source: 'Security Monitoring Agent', 
                    type: 'info', 
                    message: 'Auditing platform telemetry. Compliance: 100%.' 
                  },
                  ...prev
                ])}
                className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
              >
                <RefreshCw className="w-3 h-3" /> Sync
              </button>
            </div>

            {/* Terminal logs list */}
            <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-900 rounded-xl p-3 flex flex-col gap-3 font-mono text-[10px] leading-relaxed pr-1.5 max-h-[400px]">
              {logs.map((log) => (
                <div key={log.id} className="pb-2.5 border-b border-slate-900/60 last:border-b-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600 font-semibold">{log.time}</span>
                    <span className={`px-1 rounded text-[8px] font-bold uppercase border ${getLogTypeStyle(log.type)}`}>
                      {log.source.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    <span className="text-emerald-400 font-bold">[{log.source}] </span>
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
