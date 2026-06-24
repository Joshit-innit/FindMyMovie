import React from 'react';
import { PLATFORMS } from '../data';

interface SidebarFiltersProps {
  activePlatforms: string[];
  onTogglePlatform: (platformId: string) => void;
  activeContentTypes: string[];
  onToggleContentType: (type: 'movie' | 'tv') => void;
  minRating: number;
  onChangeMinRating: (val: number) => void;
  minYear: string;
  onChangeMinYear: (val: string) => void;
  maxYear: string;
  onChangeMaxYear: (val: string) => void;
  onClearFilters: () => void;
}

export default function SidebarFilters({
  activePlatforms,
  onTogglePlatform,
  activeContentTypes,
  onToggleContentType,
  minRating,
  onChangeMinRating,
  minYear,
  onChangeMinYear,
  maxYear,
  onChangeMaxYear,
  onClearFilters,
}: SidebarFiltersProps) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-8 sticky top-24">
      {/* Filter Title Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-[#e50914]">filter_list</span>
          <span>Filters</span>
        </h3>
        <button
          onClick={onClearFilters}
          className="text-xs text-[#e50914] font-semibold hover:underline cursor-pointer active:scale-95 flex items-center gap-0.5"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          <span>Clear All</span>
        </button>
      </div>

      {/* Content Type Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#dce2f7]/50 uppercase tracking-wider font-display">
          Content Type
        </h4>
        <div className="space-y-2">
          {(['movie', 'tv'] as const).map((type) => {
            const isChecked = activeContentTypes.includes(type);
            return (
              <label
                key={type}
                className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-[#dce2f7]/75 hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleContentType(type)}
                  className="w-4 h-4 rounded border-white/10 bg-[#141b2b] text-[#e50914] focus:ring-[#e50914] focus:ring-offset-0 cursor-pointer"
                />
                <span className="capitalize">{type === 'tv' ? 'TV Shows' : 'Movies'}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Platforms Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#dce2f7]/50 uppercase tracking-wider font-display">
          Streaming Providers
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {PLATFORMS.map((platform) => {
            const isSelected = activePlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => onTogglePlatform(platform.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#e50914]/15 border-[#e50914]/30 text-white'
                    : 'bg-[#141b2b] border-white/5 text-[#dce2f7]/60 hover:border-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">{platform.iconName}</span>
                  <span>{platform.name}</span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-base text-[#e50914] font-bold">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-[#dce2f7]/50 uppercase tracking-wider font-display">
            Minimum Rating
          </h4>
          <span className="text-xs font-mono font-bold text-amber-400">
            ★ {minRating.toFixed(1)}+
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minRating}
          onChange={(e) => onChangeMinRating(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
        />
        <div className="flex justify-between text-[10px] text-[#dce2f7]/30 font-semibold font-mono">
          <span>0.0</span>
          <span>5.0</span>
          <span>10.0</span>
        </div>
      </div>

      {/* Release Year Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#dce2f7]/50 uppercase tracking-wider font-display">
          Release Year
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-[#dce2f7]/30 uppercase tracking-wider mb-1">
              From
            </label>
            <input
              type="number"
              placeholder="Min"
              value={minYear}
              onChange={(e) => onChangeMinYear(e.target.value)}
              className="w-full px-3 py-2 bg-[#141b2b] border border-white/5 rounded-xl text-xs text-[#dce2f7] focus:outline-none focus:ring-1 focus:ring-[#e50914]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#dce2f7]/30 uppercase tracking-wider mb-1">
              To
            </label>
            <input
              type="number"
              placeholder="Max"
              value={maxYear}
              onChange={(e) => onChangeMaxYear(e.target.value)}
              className="w-full px-3 py-2 bg-[#141b2b] border border-white/5 rounded-xl text-xs text-[#dce2f7] focus:outline-none focus:ring-1 focus:ring-[#e50914]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
