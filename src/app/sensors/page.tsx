'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '../../lib/settings-context';
import { 
  Radio, 
  RefreshCw, 
  Activity, 
  BellRing, 
  AlertTriangle,
  Play, 
  Pause,
  Thermometer,
  Wind,
  Droplets,
  CloudLightning
} from 'lucide-react';

export default function SensorsPage() {
  const { currentCity } = useSettings();
  const [isStreaming, setIsStreaming] = useState(true);
  const [sensors, setSensors] = useState(currentCity.iotSensors);
  
  // Custom thresholds state
  const [tempThreshold, setTempThreshold] = useState(42.0);
  const [aqiThreshold, setAqiThreshold] = useState(140);
  
  // Alarms log state
  const [alarms, setAlarms] = useState<{ id: string; time: string; type: string; message: string; severity: 'warning' | 'critical' }[]>([]);

  // Update sensors when active city changes
  useEffect(() => {
    setSensors(currentCity.iotSensors);
    setAlarms([]);
  }, [currentCity]);

  // Simulate real-time streaming telemetry with jitter
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setSensors((prevSensors) =>
        prevSensors.map((sensor) => {
          // Generate small random walk (jitter)
          let delta = 0;
          if (sensor.type === 'Temperature') {
            delta = (Math.random() - 0.5) * 0.4;
          } else if (sensor.type === 'Humidity') {
            delta = (Math.random() - 0.5) * 2;
          } else if (sensor.type === 'Wind') {
            delta = (Math.random() - 0.5) * 0.6;
          } else {
            delta = (Math.random() - 0.5) * 4;
          }

          const newValue = Math.round((sensor.value + delta) * 10) / 10;
          const newHistory = [...sensor.history.slice(1), newValue];

          // Check threshold breaches
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          if (sensor.type === 'Temperature' && newValue >= tempThreshold) {
            triggerAlarm(time, 'Temperature', `${sensor.name} telemetry breached threshold: ${newValue}°C (Limit: ${tempThreshold}°C)`, 'critical');
          } else if (sensor.type === 'AQI' && newValue >= aqiThreshold) {
            triggerAlarm(time, 'AQI', `${sensor.name} telemetry breached threshold: ${newValue} US AQI (Limit: ${aqiThreshold})`, 'warning');
          }

          return {
            ...sensor,
            value: newValue,
            history: newHistory,
            lastUpdated: 'Just now'
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isStreaming, tempThreshold, aqiThreshold]);

  const triggerAlarm = (time: string, type: string, message: string, severity: 'warning' | 'critical') => {
    setAlarms(prev => {
      // Deduplicate alarms: don't append if the last alarm is identical
      if (prev.length > 0 && prev[0].message === message) return prev;
      return [
        {
          id: Math.random().toString(),
          time,
          type,
          message,
          severity
        },
        ...prev.slice(0, 19) // Limit to 20 alarms
      ];
    });
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'Temperature': return <Thermometer className="w-5 h-5 text-rose-400" />;
      case 'Humidity': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Wind': return <Wind className="w-5 h-5 text-cyan-400" />;
      default: return <CloudLightning className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Stream Controls */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/20">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isStreaming ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-200">
              IoT Stream: {isStreaming ? 'Active Live Feeds' : 'Paused'}
            </h3>
            <p className="text-[10px] text-slate-500">Ingesting real-time smart city microclimatic telemetry</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md ${
              isStreaming 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/15' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/15'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Ingestion
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Ingestion
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: active sensors cards list (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">{sensor.name}</h4>
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">{sensor.type} Sensor</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${
                    sensor.status === 'Active' 
                      ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' 
                      : sensor.status === 'Warning' 
                      ? 'text-amber-400 bg-amber-500/5 border border-amber-500/10' 
                      : 'text-rose-400 bg-rose-500/5 border border-rose-500/10'
                  }`}>
                    {sensor.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-3xl font-extrabold text-slate-100">{sensor.value}</span>
                  <span className="text-xs text-slate-500">{sensor.unit}</span>
                </div>

                {/* Micro trend sparks */}
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-slate-900">
                  <span className="text-[9px] text-slate-500">6h trend spark:</span>
                  <div className="flex items-end gap-1 h-6 flex-1 pr-4">
                    {sensor.history.map((val, idx) => {
                      const min = Math.min(...sensor.history);
                      const max = Math.max(...sensor.history);
                      const range = max - min || 1;
                      const heightPercent = ((val - min) / range) * 100;
                      return (
                        <div 
                          key={idx}
                          className="bg-cyan-500/30 hover:bg-cyan-400 rounded-sm w-full transition-all"
                          style={{ height: `${Math.max(heightPercent, 15)}%` }}
                          title={`Value: ${val}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[8px] text-slate-600 font-semibold">{sensor.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alert trigger configuring panel */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <BellRing className="w-4.5 h-4.5 text-emerald-400" />
                Threshold Alarm Configurations
              </h3>
              <p className="text-xs text-slate-400">Trigger alarms when sensor streams breach configured safety boundaries</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Temperature Alarm Ceiling</span>
                  <span className="font-bold text-rose-400">{tempThreshold}°C</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="48"
                  step="0.5"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">AQI Alarm Ceiling</span>
                  <span className="font-bold text-amber-400">{aqiThreshold} US AQI</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={aqiThreshold}
                  onChange={(e) => setAqiThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Alarms audit list (lg:col-span-1) */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-4 h-full min-h-[450px]">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-rose-500" />
                Active Alarms Board
              </h3>
              {alarms.length > 0 && (
                <button 
                  onClick={() => setAlarms([])}
                  className="text-[9px] text-slate-500 hover:text-slate-300"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[350px] pr-1">
              {alarms.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl p-4">
                  <BellRing className="w-6 h-6 text-slate-700 mb-1" />
                  Alarms nominal.
                  <p className="text-[9px] text-slate-700 mt-0.5">No threshold breaches reported in streaming telemetry.</p>
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div 
                    key={alarm.id} 
                    className={`p-3 rounded-lg border text-[11px] leading-relaxed flex flex-col gap-1 ${
                      alarm.severity === 'critical' 
                        ? 'bg-rose-500/5 border-rose-500/20 text-slate-200' 
                        : 'bg-amber-500/5 border-amber-500/20 text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-semibold text-slate-500">
                      <span>{alarm.time}</span>
                      <span className={`px-1 rounded text-[8px] uppercase ${
                        alarm.severity === 'critical' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {alarm.severity}
                      </span>
                    </div>
                    <p className="font-medium flex items-center gap-1">
                      <AlertTriangle className={`w-3.5 h-3.5 ${alarm.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                      {alarm.type} Breach
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{alarm.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
