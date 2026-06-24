'use client';

import React, { useState } from 'react';
import { SettingsProvider, useSettings } from '../lib/settings-context';
import { CITIES_DATA, generateDynamicCityData } from '../lib/demo-data';
import { searchLocations, fetchLiveWeather } from '../lib/weather-api';
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
  Sparkles,
  Search,
  Loader2
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setShowSearchDropdown(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectLocation = async (loc: any) => {
    setSearchLoading(true);
    try {
      const weather = await fetchLiveWeather(loc.lat, loc.lng);
      const newCityData = generateDynamicCityData(
        loc.name,
        loc.country,
        loc.lat,
        loc.lng,
        loc.population || 50000,
        loc.elevation || 10,
        weather
      );
      setCurrentCity(newCityData);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchDropdown(false);
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Failed to load weather for location', err);
    } finally {
      setSearchLoading(false);
    }
  };

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
          <div className="hidden lg:flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="relative">
              <form onSubmit={handleSearch} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs w-48 xl:w-56">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search city, village..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setShowSearchDropdown(false);
                    }
                  }}
                  className="bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none w-full placeholder-zinc-400"
                />
                {searchLoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
              </form>

              {/* Search Results Dropdown Overlay */}
              {showSearchDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1 text-xs max-h-60 overflow-y-auto">
                  {searchLoading && searchResults.length === 0 ? (
                    <div className="px-3 py-2 text-zinc-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-3 py-2 text-zinc-400">No locations found.</div>
                  ) : (
                    searchResults.map((loc) => (
                      <button
                        key={`${loc.lat}-${loc.lng}`}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                      >
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{loc.name}</span>
                        <span className="text-[10px] text-zinc-400 leading-normal">{loc.fullName}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Active City Selection */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <select
                value={currentCity.id}
                onChange={(e) => {
                  const city = CITIES_DATA.find(c => c.id === e.target.value);
                  if (city) setCurrentCity(city);
                }}
                className="bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none pr-1 font-medium cursor-pointer"
              >
                {!CITIES_DATA.some(c => c.id === currentCity.id) && (
                  <option value={currentCity.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {currentCity.name} ({currentCity.country})
                  </option>
                )}
                {CITIES_DATA.map((city) => (
                  <option key={city.id} value={city.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role-Based Access Control Selection */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-zinc-400">Role:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none pr-1 font-medium cursor-pointer capitalize"
              >
                <option value="citizen" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Citizen</option>
                <option value="researcher" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Researcher</option>
                <option value="gov_officer" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Gov Officer</option>
                <option value="admin" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">Administrator</option>
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
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
        <div className="fixed inset-0 top-[57px] z-40 bg-white/98 dark:bg-zinc-950/98 border-t border-zinc-200 dark:border-zinc-800 lg:hidden flex flex-col p-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Portals</span>
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
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Active Session Parameters</span>
            
            {/* Active City Selection Mobile */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Target City:</span>
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <select
                  value={currentCity.id}
                  onChange={(e) => {
                    const city = CITIES_DATA.find(c => c.id === e.target.value);
                    if (city) {
                      setCurrentCity(city);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none w-full capitalize"
                >
                  {!CITIES_DATA.some(c => c.id === currentCity.id) && (
                    <option value={currentCity.id} className="bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200">
                      {currentCity.name} ({currentCity.country})
                    </option>
                  )}
                  {CITIES_DATA.map((city) => (
                    <option key={city.id} value={city.id} className="bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200">
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Selection Mobile */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">User Role:</span>
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <select
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value as any);
                    setMobileMenuOpen(false);
                  }}
                  className="bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none w-full capitalize"
                >
                  <option value="citizen" className="bg-white dark:bg-zinc-900">Citizen</option>
                  <option value="researcher" className="bg-white dark:bg-zinc-900">Researcher</option>
                  <option value="gov_officer" className="bg-white dark:bg-zinc-900">Gov Officer</option>
                  <option value="admin" className="bg-white dark:bg-zinc-900">Administrator</option>
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
