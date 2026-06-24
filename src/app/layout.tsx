'use client';

import React, { useState } from 'react';
import { SettingsProvider, useSettings } from '../lib/settings-context';
import { CITIES_DATA } from '../lib/demo-data';
import { 
  ThermometerSun, 
  UserCheck, 
  MapPin, 
  Sun, 
  Moon, 
  Menu, 
  X,
  LayoutDashboard,
  Users,
  Shield,
  Radio,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

function MainLayout({ children }: { children: React.ReactNode }) {
  const { 
    theme, 
    toggleTheme, 
    userRole, 
    setUserRole, 
    currentCity, 
    setCurrentCity 
  } = useSettings();
  
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Citizen Portal', href: '/citizen', icon: Users },
    { label: 'Government Portal', href: '/government', icon: Shield },
    { label: 'Agent Command Center', href: '/agents', icon: Sparkles },
    { label: 'IoT Stream', href: '/sensors', icon: Radio },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col cyber-grid">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-[var(--card-border)] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ThermometerSun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                SafeSphere
              </span>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Urban Heat & Safety Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Active City Selection */}
            <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={currentCity.id}
                onChange={(e) => {
                  const city = CITIES_DATA.find(c => c.id === e.target.value);
                  if (city) setCurrentCity(city);
                }}
                className="bg-transparent border-none text-slate-200 focus:outline-none pr-1 font-medium cursor-pointer"
              >
                {CITIES_DATA.map((city) => (
                  <option key={city.id} value={city.id} className="bg-[#0f172a] text-slate-200">
                    {city.name} ({city.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Role-Based Access Control Selection */}
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="bg-transparent border-none text-slate-200 focus:outline-none pr-1 font-medium cursor-pointer capitalize"
              >
                <option value="citizen" className="bg-[#0f172a] text-slate-200">Citizen</option>
                <option value="researcher" className="bg-[#0f172a] text-slate-200">Researcher</option>
                <option value="gov_officer" className="bg-[#0f172a] text-slate-200">Gov Officer</option>
                <option value="admin" className="bg-[#0f172a] text-slate-200">Administrator</option>
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-40 bg-[#090d16]/95 backdrop-blur-md lg:hidden flex flex-col p-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Portals</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <hr className="border-slate-800" />

          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Session Parameters</span>
            
            {/* Active City Selection Mobile */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Target City:</span>
              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <select
                  value={currentCity.id}
                  onChange={(e) => {
                    const city = CITIES_DATA.find(c => c.id === e.target.value);
                    if (city) setCurrentCity(city);
                  }}
                  className="bg-transparent border-none text-slate-200 focus:outline-none w-full capitalize"
                >
                  {CITIES_DATA.map((city) => (
                    <option key={city.id} value={city.id} className="bg-[#0f172a]">
                      {city.name} ({city.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Selection Mobile */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">User Role:</span>
              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="bg-transparent border-none text-slate-200 focus:outline-none w-full capitalize"
                >
                  <option value="citizen">Citizen</option>
                  <option value="researcher">Researcher</option>
                  <option value="gov_officer">Gov Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-6 text-center text-xs text-slate-500 bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SafeSphere Platform. Built for the Google "Agents for Good" Track.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Support Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#090d16] text-[#f1f5f9] font-sans">
        <SettingsProvider>
          <MainLayout>{children}</MainLayout>
        </SettingsProvider>
      </body>
    </html>
  );
}
