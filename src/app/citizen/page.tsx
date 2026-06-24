'use client';

import React, { useState } from 'react';
import { useSettings } from '../../lib/settings-context';
import { calculateWBGT } from '../../lib/physics-engine';
import { CoolingShelter } from '../../lib/demo-data';
import { querySingleAgent, queryUniversalAI } from '../../lib/agents-orchestrator';
import GisMap from '../../components/gis-map';
import { 
  ShieldAlert, 
  Send, 
  Compass, 
  Phone, 
  Clock, 
  BookOpen, 
  MessageSquare,
  Sparkles,
  Heart
} from 'lucide-react';

export default function CitizenPortal() {
  const { currentCity, geminiApiKey } = useSettings();
  const [selectedShelter, setSelectedShelter] = useState<CoolingShelter | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    {
      sender: 'agent',
      text: `Hello! I am the SafeSphere AI Climate Assistant. Currently, I am analyzing local microclimatic conditions in ${currentCity.name}. Let me know if you need nearest cooling shelter directories, heat safety guidelines, details about how to run simulations, or have any general climate questions!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const wbgtRes = calculateWBGT(
    currentCity.baseParams.airTemp,
    currentCity.baseParams.relativeHumidity,
    currentCity.baseParams.solarRad,
    currentCity.baseParams.windSpeed
  );

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    // User message
    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    
    setIsTyping(true);

    try {
      // Query Universal AI Chatbot
      const response = await queryUniversalAI(query, currentCity, geminiApiKey);
      
      setMessages(prev => [...prev, {
        sender: 'agent',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'agent',
        text: 'Sorry, I encountered an error communicating with the agent. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'How do I use this simulation?',
    'Nearest cooling shelter details',
    'Heat stroke vs heat exhaustion symptoms',
    'Explain the thermodynamic physics of albedo'
  ];

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Alert Header */}
      <div className="p-4 rounded-xl glass-panel border border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-200">
              {currentCity.disasterAlert ? currentCity.disasterAlert.message : 'No Active Disaster Alerts'}
            </h2>
            <p className="text-xs text-slate-400">
              Wet Bulb Globe Index: <span className="text-cyan-400 font-bold">{wbgtRes.wbgt}°C</span> ({wbgtRes.riskLevel} Heat Risk)
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-semibold bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg w-fit">
          Advisory: {wbgtRes.description}
        </div>
      </div>

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Left Side: GIS Map & Shelter Navigator */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Resilience Shelter Navigator
            </h3>
            <p className="text-xs text-slate-400">Select markers on the map or shelters below to navigate</p>
          </div>

          {/* Map canvas */}
          <div className="h-[280px]">
            <GisMap 
              city={currentCity} 
              selectedShelter={selectedShelter} 
              onSelectShelter={setSelectedShelter} 
            />
          </div>

          {/* Shelters List */}
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px]">
            {currentCity.coolingShelters.map((shelter) => (
              <div
                key={shelter.id}
                onClick={() => setSelectedShelter(shelter)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                  selectedShelter?.id === shelter.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-slate-100'
                    : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/30'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs">{shelter.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{shelter.address}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3.5 h-3.5" /> status: 
                      <span className={`font-semibold ${shelter.status === 'Open' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {shelter.status}
                      </span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Phone className="w-3.5 h-3.5" /> {shelter.contact}
                    </span>
                  </div>
                </div>

                {/* Capacity badge */}
                <div className="text-right sm:text-left">
                  <div className="text-[9px] text-slate-500 uppercase font-semibold">Occupancy</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">
                    {shelter.occupied} <span className="text-[10px] text-slate-500">/ {shelter.capacity}</span>
                  </div>
                  <div className="w-16 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        (shelter.occupied / shelter.capacity) > 0.8 ? 'bg-rose-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${(shelter.occupied / shelter.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chatbot interface */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800/80 flex flex-col gap-4 h-full min-h-[500px]">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">Citizen Support Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Active Support Agent
                </p>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Role: Citizen
            </span>
          </div>

          {/* Quick FAQ Tags */}
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50 hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-4 min-h-[220px] max-h-[300px]">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-bl-none'
                }`}>
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>{line}</p>
                  ))}
                </div>
                <span className="text-[8px] text-slate-500 mt-1">{msg.time}</span>
              </div>
            ))}
            {isTyping && (
              <div className="self-start bg-slate-900 border border-slate-800 p-2 px-3 rounded-xl rounded-bl-none text-[10px] text-slate-400 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                Agent is thinking...
              </div>
            )}
          </div>

          {/* Input field */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask for safety guidelines, nearest shelter..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Safe Sphere Footer advisory */}
          <div className="text-[9px] text-slate-500 flex items-center gap-1 justify-center mt-1 border-t border-slate-800 pt-3">
            <BookOpen className="w-3.5 h-3.5" /> Standard emergency protocols verified by the Disaster Preparedness Agent.
          </div>
        </div>
      </div>
    </div>
  );
}
