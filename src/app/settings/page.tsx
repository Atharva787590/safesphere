'use client';

import React, { useState } from 'react';
import { useSettings, FirebaseConfig } from '../../lib/settings-context';
import { 
  Settings as SettingsIcon, 
  Key, 
  Database, 
  Map, 
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    googleMapsApiKey,
    setGoogleMapsApiKey,
    firebaseConfig,
    setFirebaseConfig,
    isFirebaseActive,
    isGeminiActive
  } = useSettings();

  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey);
  const [mapsKeyInput, setMapsKeyInput] = useState(googleMapsApiKey);
  const [showGemini, setShowGemini] = useState(false);
  const [showMaps, setShowMaps] = useState(false);

  // Firebase form inputs
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig.apiKey);
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig.authDomain);
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig.projectId);
  const [fbStorageBucket, setFbStorageBucket] = useState(firebaseConfig.storageBucket);
  const [fbSenderId, setFbSenderId] = useState(firebaseConfig.messagingSenderId);
  const [fbAppId, setFbAppId] = useState(firebaseConfig.appId);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveKeys = () => {
    setGeminiApiKey(geminiKeyInput);
    setGoogleMapsApiKey(mapsKeyInput);
    
    const newFbConfig: FirebaseConfig = {
      apiKey: fbApiKey,
      authDomain: fbAuthDomain,
      projectId: fbProjectId,
      storageBucket: fbStorageBucket,
      messagingSenderId: fbSenderId,
      appId: fbAppId
    };
    setFirebaseConfig(newFbConfig);

    setSaveStatus('Preferences saved successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearKeys = () => {
    setGeminiKeyInput('');
    setMapsKeyInput('');
    setFbApiKey('');
    setFbAuthDomain('');
    setFbProjectId('');
    setFbStorageBucket('');
    setFbSenderId('');
    setFbAppId('');

    setGeminiApiKey('');
    setGoogleMapsApiKey('');
    setFirebaseConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });

    setSaveStatus('Credentials cleared. Reverted to Mock mode.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 py-2 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-slate-200">System Integration Settings</h2>
          <p className="text-xs text-slate-400">Configure cloud credentials to toggle SafeSphere from Mock to Live integrations</p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
          {saveStatus}
        </div>
      )}

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: forms inputs (md:col-span-2) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Gemini & Google Maps keys */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
              <Key className="w-4.5 h-4.5 text-emerald-400" /> API Credentials
            </h3>

            {/* Gemini key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Google Gemini API Key (Vertex AI)</label>
              <div className="relative flex items-center">
                <input
                  type={showGemini ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[9px] text-slate-500">Acquired from Google AI Studio. Enables active Gemini 1.5 model reasoning.</span>
            </div>

            {/* Google maps key */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Google Maps API Key</label>
              <div className="relative flex items-center">
                <input
                  type={showMaps ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={mapsKeyInput}
                  onChange={(e) => setMapsKeyInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowMaps(!showMaps)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showMaps ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[9px] text-slate-500">Enables satellite layers and address queries geocoding.</span>
            </div>
          </div>

          {/* Firebase Web SDK config */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-900 pb-2">
              <Database className="w-4.5 h-4.5 text-cyan-400" /> Firebase Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-medium">Firebase Web API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-medium">Project ID</label>
                <input
                  type="text"
                  placeholder="safesphere-abc12"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-medium">Auth Domain</label>
                <input
                  type="text"
                  placeholder="safesphere-abc12.firebaseapp.com"
                  value={fbAuthDomain}
                  onChange={(e) => setFbAuthDomain(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-medium">Storage Bucket</label>
                <input
                  type="text"
                  placeholder="safesphere-abc12.appspot.com"
                  value={fbStorageBucket}
                  onChange={(e) => setFbStorageBucket(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-medium">Messaging Sender ID</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={fbSenderId}
                  onChange={(e) => setFbSenderId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-medium">App ID</label>
                <input
                  type="text"
                  placeholder="1:12345:web:abcd"
                  value={fbAppId}
                  onChange={(e) => setFbAppId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
            </div>
            <span className="text-[9px] text-slate-500">Required to connect with Google Auth, Citizen Reports database, and audits logging.</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClearKeys}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Clear & Use Mock Mode
            </button>
            <button
              onClick={handleSaveKeys}
              className="px-5 py-2 glow-btn-primary font-semibold rounded-xl text-xs"
            >
              Save Credentials
            </button>
          </div>
        </div>

        {/* Right Side: integration guide status (md:col-span-1) */}
        <div className="flex flex-col gap-6">
          {/* Status Tracker */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Connection Hub</h3>
            <div className="flex flex-col gap-3">
              {/* Gemini status */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Gemini AI Models</span>
                {isGeminiActive ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500 font-semibold text-[10px]">
                    <XCircle className="w-3.5 h-3.5" /> Mock Fallback
                  </span>
                )}
              </div>

              {/* Maps status */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Google Maps API</span>
                {googleMapsApiKey ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500 font-semibold text-[10px]">
                    <XCircle className="w-3.5 h-3.5" /> Canvas Fallback
                  </span>
                )}
              </div>

              {/* Firebase status */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Firebase Firestore</span>
                {isFirebaseActive ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500 font-semibold text-[10px]">
                    <XCircle className="w-3.5 h-3.5" /> LocalStorage
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Setup Help */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col gap-3">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Setup Guide
            </h3>
            <div className="flex flex-col gap-2.5 text-[10px] text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-300">1. Google AI Studio:</strong> Visit <a href="https://aistudio.google.com" target="_blank" className="text-emerald-400 underline">aistudio.google.com</a>, create an API key, and paste it into the Gemini slot.
              </p>
              <p>
                <strong className="text-slate-300">2. Firebase Console:</strong> Create a web project at <a href="https://console.firebase.google.com" target="_blank" className="text-emerald-400 underline">console.firebase.google.com</a>. Turn on Email & Google sign-in and initialize a Cloud Firestore database. Copy the Web Configuration details into the slots.
              </p>
              <p>
                <strong className="text-slate-300">3. Google Maps:</strong> Create a project in Google Cloud Console, enable the Maps JavaScript API and geocoding, and restrict your keys.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
