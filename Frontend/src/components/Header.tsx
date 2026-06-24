import React, { useState } from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  watchlistCount: number;
  onOpenAdvisor: () => void;
}

export default function Header({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  watchlistCount,
  onOpenAdvisor,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const navItems: { label: string; view: View }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Movies', view: 'explore' }, // Takes to explore view
    { label: 'Platforms', view: 'platforms' },
    { label: 'Watchlist', view: 'watchlist' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#0c1322]/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-red-950/5">
        <nav className="flex justify-between items-center px-6 md:px-16 py-4 w-full max-w-7xl mx-auto">
          {/* Brand Logo */}
          <div
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="text-2xl font-display font-black text-[#e50914] uppercase tracking-tighter cursor-pointer flex items-center gap-1 active:scale-95"
            id="brand-logo"
          >
            <span className="material-symbols-outlined text-3xl font-black">movie_filter</span>
            <span>FindMyMovie</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`relative font-sans text-sm font-semibold tracking-wide transition-colors py-1 cursor-pointer ${
                    isActive
                      ? 'text-[#e50914]'
                      : 'text-[#dce2f7]/70 hover:text-[#dce2f7]'
                  }`}
                  id={`nav-${item.view}`}
                >
                  {item.label}
                  {item.label === 'Watchlist' && watchlistCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-[#e50914] text-white rounded-full font-bold">
                      {watchlistCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e50914] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Search Form inside Header (Visible on desktop and md+) */}
            <form onSubmit={onSearchSubmit} className="relative hidden md:block group">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-[#141b2b] text-sm text-[#dce2f7] rounded-full px-5 py-2 pr-10 w-48 focus:w-64 focus:outline-none focus:ring-2 focus:ring-[#e50914] border border-white/5 transition-all duration-300 placeholder:text-[#dce2f7]/30"
                id="header-search-input"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#dce2f7]/40 hover:text-[#e50914] cursor-pointer"
                id="header-search-btn"
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
            </form>

            {/* AI Cinephile Advisor Shortcut */}
            <button
              onClick={onOpenAdvisor}
              className="p-2 rounded-full bg-[#191f2f] hover:bg-[#e50914]/20 hover:text-[#e50914] text-[#dce2f7]/80 transition-colors flex items-center justify-center cursor-pointer active:scale-90 relative"
              title="AI Advisor"
              id="header-ai-advisor"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0c1322]" />
            </button>

            {/* Developer/Terminal diagnostics button */}
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className={`p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-90 ${
                showDevPanel
                  ? 'bg-[#e50914] text-white'
                  : 'bg-[#191f2f] hover:bg-slate-700 text-[#dce2f7]/80'
              }`}
              title="System Diagnostics"
              id="header-dev-terminal"
            >
              <span className="material-symbols-outlined text-xl">terminal</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-[#dce2f7]/80 hover:text-white cursor-pointer active:scale-90 flex items-center"
              id="mobile-menu-toggle"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div
            className="md:hidden bg-[#0c1322] border-t border-white/5 px-6 py-6 space-y-4 shadow-2xl animate-fade-in"
            id="mobile-menu-panel"
          >
            {/* Search for Mobile */}
            <form onSubmit={onSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-[#141b2b] text-sm text-[#dce2f7] rounded-full px-5 py-3 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-[#e50914] border border-white/5"
                id="mobile-search-input"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#dce2f7]/40 hover:text-[#e50914]"
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
            </form>

            <div className="flex flex-col gap-2 pt-2">
              {navItems.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      onNavigate(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[#e50914]/10 text-[#e50914]'
                        : 'text-[#dce2f7]/70 hover:bg-white/5 hover:text-[#dce2f7]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.label === 'Watchlist' && watchlistCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-[#e50914] text-white rounded-full font-bold">
                        {watchlistCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Dev Diagnostics Modal/Card */}
      {showDevPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            <div className="bg-[#141b2b] px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FindMyMovie Terminal v1.0.0</span>
              </div>
              <button
                onClick={() => setShowDevPanel(false)}
                className="text-[#dce2f7]/60 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 font-mono text-xs text-[#dce2f7]/80 space-y-4 max-h-[350px] overflow-y-auto">
              <div>
                <span className="text-[#e50914] font-bold">System Status:</span>
                <span className="text-emerald-400 ml-2">● Online</span>
              </div>
              <div className="border-t border-white/5 pt-2">
                <span className="text-blue-400">[info]</span> Indexing 50+ movie platforms daily...
              </div>
              <div>
                <span className="text-blue-400">[info]</span> Streaming services status:
                <ul className="list-disc list-inside pl-4 mt-1 text-[#dce2f7]/60 space-y-1">
                  <li>Netflix API: <span className="text-emerald-400 font-bold">CONNECTED</span></li>
                  <li>Disney+ API: <span className="text-emerald-400 font-bold">CONNECTED</span></li>
                  <li>Amazon Prime Feed: <span className="text-emerald-400 font-bold">CONNECTED</span></li>
                  <li>Apple TV+ Catalog: <span className="text-emerald-400 font-bold">CONNECTED</span></li>
                </ul>
              </div>
              <div className="border-t border-white/5 pt-2">
                <span className="text-amber-400">[stats]</span> Active indexed catalog titles: <span className="text-white font-bold">48,420</span>
              </div>
              <div>
                <span className="text-emerald-400">[cache]</span> Client cache: <span className="text-[#e50914]">VALIDATED</span>
              </div>
            </div>
            <div className="bg-[#141b2b] px-6 py-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowDevPanel(false)}
                className="px-4 py-2 bg-[#e50914] text-white text-xs font-bold rounded-lg hover:bg-opacity-90 active:scale-95 cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
