import React from 'react';
import { Movie } from '../types';

const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23141b2b"/%3E%3Crect x="88" y="180" width="224" height="150" rx="18" fill="%23191f2f"/%3E%3Ctext x="200" y="390" text-anchor="middle" fill="%23dce2f7" opacity=".55" font-family="Arial" font-size="20" font-weight="700"%3ENo Poster%3C/text%3E%3C/svg%3E';

interface TrendingCardProps {
  movie: Movie;
  onClick: () => void;
  onWatchlistToggle: () => void;
  isWatchlisted: boolean;
}

const TrendingCard: React.FC<TrendingCardProps> = ({
  movie,
  onClick,
  onWatchlistToggle,
  isWatchlisted,
}) => {
  const title = movie.title || 'Unknown Title';

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-80 group relative rounded-2xl overflow-hidden bg-[#141b2b] border border-white/5 shadow-2xl hover:border-red-500/20 hover:shadow-red-950/10 transition-all duration-300 cursor-pointer hover:-translate-y-1"
      id={`trending-card-${movie.id}`}
    >
      {/* Aspect Ratio Container (16:9 or custom height) */}
      <div className="relative h-44 w-full overflow-hidden">
        {/* Backdrop Image */}
        <img
          src={movie.backdropUrl || movie.posterUrl || PLACEHOLDER_POSTER}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_POSTER;
          }}
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141b2b] via-[#141b2b]/40 to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg flex items-center gap-1 text-[11px] font-bold text-amber-400 border border-white/5">
          <span className="material-symbols-outlined text-[12px] fill-amber-400">star</span>
          <span>{movie.stars.toFixed(1)}</span>
        </div>

        {/* Watchlist Quick Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle();
          }}
          className={`absolute top-3 left-3 p-2 rounded-lg backdrop-blur-md border transition-all active:scale-90 cursor-pointer ${
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

      {/* Content Details */}
      <div className="p-5 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-display font-bold text-lg text-white group-hover:text-[#e50914] transition-colors line-clamp-1">
            {title}
          </h3>
          <span className="text-xs font-semibold text-[#dce2f7]/30 flex-shrink-0 mt-1">
            {movie.year}
          </span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {movie.genres.map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-medium text-[#dce2f7]/60"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-[#dce2f7]/40 line-clamp-2 leading-relaxed">
          {movie.description}
        </p>

        {/* Stream Availability Indicator */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
          <span className="text-[#dce2f7]/40">Stream Available On:</span>
          <div className="flex gap-1.5">
            {movie.streamingProviders.slice(0, 3).map((prov) => (
              <span
                key={prov.platform}
                className="px-1.5 py-0.5 rounded-md bg-[#191f2f] text-white border border-white/5 font-semibold text-[9px]"
              >
                {prov.platform}
              </span>
            ))}
            {movie.streamingProviders.length > 3 && (
              <span className="text-[9px] text-[#dce2f7]/40 self-center">
                +{movie.streamingProviders.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
