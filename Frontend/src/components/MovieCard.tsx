import React from 'react';
import { Movie } from '../types';

const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23141b2b"/%3E%3Crect x="88" y="180" width="224" height="150" rx="18" fill="%23191f2f"/%3E%3Ctext x="200" y="390" text-anchor="middle" fill="%23dce2f7" opacity=".55" font-family="Arial" font-size="20" font-weight="700"%3ENo Poster%3C/text%3E%3C/svg%3E';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  onWatchlistToggle: () => void;
  isWatchlisted: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onClick,
  onWatchlistToggle,
  isWatchlisted,
}) => {
  const title = movie.title || 'Unknown Title';

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden bg-[#141b2b] border border-white/5 shadow-xl hover:border-red-500/20 hover:shadow-red-950/10 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
      id={`movie-card-${movie.id}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl || PLACEHOLDER_POSTER}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_POSTER;
          }}
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full py-2.5 bg-[#e50914] text-white rounded-xl text-xs font-bold hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] fill-white">play_arrow</span>
            <span>View Details</span>
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg flex items-center gap-1 text-[11px] font-bold text-amber-400 border border-white/5 z-10">
          <span className="material-symbols-outlined text-[12px] fill-amber-400">star</span>
          <span>{movie.stars.toFixed(1)}</span>
        </div>

        {/* Content Type Badge (TV or Movie) */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-wider border border-white/5 z-10">
          {movie.type === 'tv' ? 'TV Show' : 'Movie'}
        </div>

        {/* Watchlist Quick Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle();
          }}
          className={`absolute bottom-3 right-3 p-2 rounded-lg backdrop-blur-md border transition-all active:scale-90 cursor-pointer z-10 ${
            isWatchlisted
              ? 'bg-[#e50914] border-[#e50914] text-white'
              : 'bg-black/40 border-white/10 text-white/80 hover:bg-black/60 hover:text-white'
          }`}
          title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <span className="material-symbols-outlined text-[16px] block">
            {isWatchlisted ? 'bookmark_added' : 'bookmark'}
          </span>
        </button>
      </div>

      {/* Details Footer */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-2">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm text-white group-hover:text-[#e50914] transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-[#dce2f7]/40">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.runtime}</span>
          </div>
        </div>

        {/* Platforms Badge Icons */}
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
          {movie.streamingProviders.map((prov) => (
            <span
              key={prov.platform}
              className="text-[9px] px-1.5 py-0.5 rounded bg-[#191f2f] text-slate-300 font-semibold border border-white/5"
              title={`${prov.platform} (${prov.type})`}
            >
              {prov.platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
