import React, { useState, useEffect, useMemo } from 'react';
import { View, Movie, Platform } from './types';
import { PLATFORMS } from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import TrendingCard from './components/TrendingCard';
import MovieCard from './components/MovieCard';
import SidebarFilters from './components/SidebarFilters';
import CinephileAdvisor from './components/CinephileAdvisor';
import { useMovie } from './hooks/useMovie';
import { usePlatform } from './hooks/usePlatform';
import { useSearch } from './hooks/useSearch';
import { useTrending } from './hooks/useTrending';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedMovieId, setSelectedMovieId] = useState<string>('interstellar');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [activeContentTypes, setActiveContentTypes] = useState<string[]>(['movie', 'tv']);
  const [minRating, setMinRating] = useState<number>(0);
  const [minYear, setMinYear] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'year'>('popularity');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Watchlist (Local Storage Persistence)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('moviefinder_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Advisor Open State
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const trending = useTrending();
  const platformMovies = usePlatform(selectedPlatform);
  const search = useSearch(
    {
      title: searchQuery,
      platform: activePlatforms.join(','),
    },
    currentView === 'explore' && !selectedPlatform
  );
  const movieDetails = useMovie(currentView === 'movie-detail' ? selectedMovieId : null);

  useEffect(() => {
    const applyPath = () => {
      const [, route, id] = window.location.pathname.split('/');

      if (route === 'movie' && id) {
        setSelectedMovieId(decodeURIComponent(id));
        setCurrentView('movie-detail');
        return;
      }

      if (route === 'platform' && id) {
        const platform = decodeURIComponent(id);
        setSelectedPlatform(platform);
        setActivePlatforms([platform]);
        setCurrentView('explore');
        return;
      }

      if (route === 'search') {
        setSelectedPlatform(null);
        setCurrentView('explore');
        return;
      }

      if (route === 'watchlist') {
        setSelectedPlatform(null);
        setCurrentView('watchlist');
        return;
      }

      setCurrentView('home');
    };

    applyPath();
    window.addEventListener('popstate', applyPath);
    return () => window.removeEventListener('popstate', applyPath);
  }, []);

  useEffect(() => {
    const nextPath =
      currentView === 'movie-detail'
        ? `/movie/${encodeURIComponent(selectedMovieId)}`
        : currentView === 'watchlist'
          ? '/watchlist'
          : currentView === 'explore' && selectedPlatform
            ? `/platform/${encodeURIComponent(selectedPlatform)}`
            : currentView === 'explore'
              ? '/search'
              : '/';

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
  }, [currentView, selectedMovieId, selectedPlatform]);

  // Sync Watchlist to Local Storage
  useEffect(() => {
    localStorage.setItem('moviefinder_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Display Toast message helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle Watchlist handler
  const handleToggleWatchlist = (movieId: string) => {
    if (watchlist.includes(movieId)) {
      setWatchlist((prev) => prev.filter((id) => id !== movieId));
      showToast('Removed from your Watchlist');
    } else {
      setWatchlist((prev) => [...prev, movieId]);
      showToast('Added to your Watchlist');
    }
  };

  // Filter & Sort Movie library
  const catalogMovies = selectedPlatform ? platformMovies.data : search.data;
  const catalogLoading = selectedPlatform ? platformMovies.loading : search.loading;
  const catalogError = selectedPlatform ? platformMovies.error : search.error;
  const refetchCatalog = selectedPlatform ? platformMovies.refetch : search.refetch;

  const filteredMovies = useMemo(() => {
    return catalogMovies.filter((movie) => {
      // Search matching title, genres, description, or cast
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(query);
        const matchesGenres = movie.genres.some((g) => g.toLowerCase().includes(query));
        const matchesDirector = movie.director?.toLowerCase().includes(query) ?? false;
        const matchesCast = movie.cast?.some((c) => c.toLowerCase().includes(query)) ?? false;
        
        if (!matchesTitle && !matchesGenres && !matchesDirector && !matchesCast) {
          return false;
        }
      }

      // Content Type matches
      if (!activeContentTypes.includes(movie.type)) {
        return false;
      }

      // Platform matches (or matches any provider of that platform)
      if (activePlatforms.length > 0) {
        if (movie.streamingProviders.length === 0) {
          return true;
        }
        const normalizedActivePlatforms = activePlatforms.map((platform) =>
          platform.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        const hasMatchingPlatform = movie.streamingProviders.some((prov) =>
          normalizedActivePlatforms.includes(prov.platform.toLowerCase().replace(/[^a-z0-9]/g, ''))
        );
        if (!hasMatchingPlatform) return false;
      }

      // Rating range match
      if (movie.stars < minRating) {
        return false;
      }

      // Year range match
      if (minYear !== '' && movie.year < parseInt(minYear)) {
        return false;
      }
      if (maxYear !== '' && movie.year > parseInt(maxYear)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return b.stars - a.stars;
      }
      if (sortBy === 'year') {
        return b.year - a.year;
      }
      // Popularity (stars desc, secondary title asc)
      if (b.stars !== a.stars) {
        return b.stars - a.stars;
      }
      return a.title.localeCompare(b.title);
    });
  }, [catalogMovies, searchQuery, activePlatforms, activeContentTypes, minRating, minYear, maxYear, sortBy]);

  // Selected Movie for Detail View
  const selectedMovie = useMemo(() => {
    return movieDetails.data.movie;
  }, [movieDetails.data.movie]);

  const knownMoviesById = useMemo(() => {
    const entries = [
      ...trending.data,
      ...catalogMovies,
      ...movieDetails.data.similar,
      ...(movieDetails.data.movie ? [movieDetails.data.movie] : []),
    ];
    return new Map(entries.map((movie) => [movie.id, movie]));
  }, [catalogMovies, movieDetails.data.movie, movieDetails.data.similar, trending.data]);

  // Quick platform card filters from Home or Platforms tab
  const handleQuickPlatformFilter = (platformId: string) => {
    setActivePlatforms([platformId]);
    setSelectedPlatform(platformId);
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Header search bar trigger
  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPlatform(null);
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to standard view and reset filters
  const navigateToView = (view: View) => {
    setCurrentView(view);
    if (view === 'home') {
      // Clear filters on home return to let users start fresh
      setActivePlatforms([]);
      setSelectedPlatform(null);
      setMinRating(0);
      setMinYear('');
      maxYear && setMaxYear('');
      setSearchQuery('');
    }
    if (view === 'explore') {
      setSelectedPlatform(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle clicking similar movie in details
  const handleSimilarMovieClick = (id: string) => {
    setSelectedMovieId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0c1322] text-[#dce2f7] antialiased">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#e50914] text-white px-6 py-3 rounded-xl shadow-2xl border border-[#ff3b45]/30 flex items-center gap-2 font-semibold text-xs animate-bounce md:text-sm">
          <span className="material-symbols-outlined text-lg">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Chat Advisor Shortcut */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setAdvisorOpen(!advisorOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-[#e50914] text-white rounded-full shadow-2xl shadow-red-950/40 hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer font-bold font-display text-xs"
          id="floating-ai-trigger"
        >
          <span className="material-symbols-outlined text-lg animate-pulse">chat</span>
          <span>Chat AI Advisor</span>
        </button>
      </div>

      {/* Main Layout Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateToView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleHeaderSearchSubmit}
        watchlistCount={watchlist.length}
        onOpenAdvisor={() => setAdvisorOpen(true)}
      />

      {/* View Content Outlet */}
      <main className="flex-grow pt-24 pb-16">
        {currentView === 'home' && (
          <div className="space-y-20 animate-fade-in">
            {/* Hero Banner Section */}
            <section className="relative px-6 md:px-16 pt-12 pb-24 w-full max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
              {/* Decorative radial gradients */}
              <div className="absolute top-0 -z-10 w-full max-w-3xl h-[400px] bg-red-900/10 rounded-full blur-[120px]" />

              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-[#e50914] uppercase tracking-widest font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
                  <span>Real-time Streaming Guides</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] pt-2">
                  Find Where Any Movie Is <span className="text-[#e50914]">Streaming</span>
                </h1>
                <p className="text-base md:text-lg text-[#dce2f7]/55 leading-relaxed">
                  Stop scrolling endlessly through apps. Search across Netflix, Disney+, Prime Video, Apple TV, and 50+ other catalogs indexed in real-time.
                </p>
              </div>

              {/* Main Search Panel Card */}
              <div className="w-full max-w-2xl bg-[#141b2b]/80 border border-white/5 shadow-2xl p-4 md:p-6 rounded-2xl backdrop-blur-xl">
                <form
                  onSubmit={handleHeaderSearchSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#dce2f7]/30">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search by title, genre, director, or cast..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0c1322] text-[#dce2f7] rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e50914] border border-white/5"
                      id="hero-main-search-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-3.5 px-8 bg-[#e50914] text-white font-bold text-sm rounded-xl hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-red-950/30"
                    id="hero-search-submit-btn"
                  >
                    <span>Search Index</span>
                  </button>
                </form>

                {/* Quick Access Platform chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                  <span className="text-[#dce2f7]/40 font-medium">Quick filters:</span>
                  {['Netflix', 'Disney+', 'Prime Video', 'Apple TV+'].map((platName) => (
                    <button
                      key={platName}
                      onClick={() => handleQuickPlatformFilter(platName.toLowerCase())}
                      className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[#dce2f7]/70 hover:text-white hover:bg-[#e50914]/10 hover:border-[#e50914]/20 transition-all cursor-pointer font-semibold"
                    >
                      {platName}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Trending Carousel Section */}
            <section className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                    Trending Right Now
                  </h2>
                  <p className="text-xs text-[#dce2f7]/45">
                    Viral blockbusters and prestige masterpieces indexed this week.
                  </p>
                </div>
                <button
                  onClick={() => navigateToView('explore')}
                  className="text-xs font-bold text-[#e50914] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>

              {/* Scrolling Container */}
              <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                {trending.loading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-80 rounded-2xl overflow-hidden bg-[#141b2b] border border-white/5 animate-pulse"
                    >
                      <div className="h-44 bg-white/5" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 w-2/3 bg-white/5 rounded" />
                        <div className="h-3 w-full bg-white/5 rounded" />
                        <div className="h-3 w-3/4 bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                {!trending.loading &&
                  !trending.error &&
                  trending.data.map((movie) => (
                    <TrendingCard
                      key={movie.id}
                      movie={movie}
                      onClick={() => {
                        setSelectedMovieId(movie.id);
                        setCurrentView('movie-detail');
                      }}
                      onWatchlistToggle={() => handleToggleWatchlist(movie.id)}
                      isWatchlisted={watchlist.includes(movie.id)}
                    />
                  ))}
                {!trending.loading && trending.error && (
                  <div className="w-full py-10 bg-[#141b2b]/40 rounded-2xl border border-white/5 text-center space-y-3">
                    <p className="text-sm font-semibold text-white">{trending.error}</p>
                    <button
                      onClick={trending.refetch}
                      className="px-4 py-2 bg-[#e50914] text-white font-bold text-xs rounded-xl hover:bg-opacity-95 cursor-pointer transition-all"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Popular Platforms Grid Section */}
            <section className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                  Popular Streaming Platforms
                </h2>
                <p className="text-xs text-[#dce2f7]/45">
                  Direct links to browse titles by your favorite streaming catalogs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLATFORMS.slice(0, 4).map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => handleQuickPlatformFilter(platform.id)}
                    className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-48 relative group overflow-hidden"
                  >
                    {/* Platform accent glow */}
                    <div
                      className="absolute -right-12 -bottom-12 w-28 h-28 rounded-full blur-[40px] opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                      style={{ backgroundColor: platform.accentColor }}
                    />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <img
                          src={platform.logoUrl}
                          alt={platform.name}
                          className="h-7 object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                        <span className="material-symbols-outlined text-[#dce2f7]/40 group-hover:text-white transition-colors">
                          {platform.iconName}
                        </span>
                      </div>
                      <p className="text-xs text-[#dce2f7]/45 line-clamp-2 leading-relaxed">
                        {platform.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-[11px] font-bold text-[#dce2f7]/40">
                        {platform.titleCount}
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-[#e50914] transition-colors flex items-center gap-0.5">
                        <span>Browse</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cinephile Features Banner */}
            <section className="px-6 md:px-16 w-full max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141b2b] to-[#0c1322] border border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 justify-between shadow-2xl">
                <div className="space-y-4 max-w-lg">
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 rounded-full w-max uppercase font-mono">
                    NEW FEATURE
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white">
                    Need Recommendations? Chat with AIDA AI Advisor
                  </h3>
                  <p className="text-sm text-[#dce2f7]/55 leading-relaxed">
                    Instantly brainstorm movie nights. Describe your exact vibe, reference actors, or ask for sci-fi suggestions and watch our agent locate matches.
                  </p>
                  <button
                    onClick={() => setAdvisorOpen(true)}
                    className="py-3 px-6 bg-white text-black font-bold text-xs rounded-xl hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xl"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    <span>Launch AI Advisor</span>
                  </button>
                </div>

                <div className="w-full max-w-[280px] h-[180px] bg-[#0c1322]/80 rounded-2xl border border-white/10 p-4 font-mono text-[10px] space-y-3 shadow-inner flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-slate-400">&gt; Ask AIDA: "Sci-Fi with Ryan Gosling"</div>
                    <div className="text-emerald-400">
                      [AIDA] Locating cybernetic thrillers...
                    </div>
                    <div className="text-xs text-white border-l-2 border-[#e50914] pl-2 font-display py-0.5">
                      Live API matches ready
                    </div>
                  </div>
                  <div className="text-right text-[#dce2f7]/30 text-[9px]">AIDA-Core v1.0</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Explore / Catalog View */}
        {currentView === 'explore' && (
          <div className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
                  Cinematic Streaming Catalog
                </h1>
                <p className="text-xs text-[#dce2f7]/45">
                  Browse, search, and narrow down indexed movies in real-time.
                </p>
              </div>

              {/* Sorting & Result Counts */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-xs font-semibold text-[#dce2f7]/40">
                  {filteredMovies.length} title(s) found
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#141b2b] text-xs font-bold text-white rounded-xl border border-white/5 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#e50914]"
                >
                  <option value="popularity">Sort: Popularity</option>
                  <option value="rating">Sort: Star Rating</option>
                  <option value="year">Sort: Release Year</option>
                </select>
              </div>
            </div>

            {/* Sidebar + Results Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Column Sidebar Filters */}
              <div className="lg:col-span-1">
                <SidebarFilters
                  activePlatforms={activePlatforms}
                  onTogglePlatform={(id) => {
                    setSelectedPlatform(null);
                    setActivePlatforms((prev) =>
                      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
                    );
                  }}
                  activeContentTypes={activeContentTypes}
                  onToggleContentType={(type) => {
                    setActiveContentTypes((prev) =>
                      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                    );
                  }}
                  minRating={minRating}
                  onChangeMinRating={setMinRating}
                  minYear={minYear}
                  onChangeMinYear={setMinYear}
                  maxYear={maxYear}
                  onChangeMaxYear={setMaxYear}
                  onClearFilters={() => {
                    setActivePlatforms([]);
                    setSelectedPlatform(null);
                    setActiveContentTypes(['movie', 'tv']);
                    setMinRating(0);
                    setMinYear('');
                    setMaxYear('');
                    setSearchQuery('');
                  }}
                />
              </div>

              {/* Right Column Movie Grid */}
              <div className="lg:col-span-3 space-y-8">
                {catalogLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl overflow-hidden bg-[#141b2b] border border-white/5 animate-pulse"
                      >
                        <div className="aspect-[2/3] bg-white/5" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 w-2/3 bg-white/5 rounded" />
                          <div className="h-3 w-1/2 bg-white/5 rounded" />
                          <div className="h-6 w-full bg-white/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : catalogError ? (
                  <div className="text-center py-20 bg-[#141b2b]/40 rounded-3xl border border-white/5 space-y-4 max-w-xl mx-auto">
                    <span className="material-symbols-outlined text-4xl text-[#dce2f7]/30">
                      cloud_off
                    </span>
                    <h3 className="font-display font-bold text-lg text-white">
                      Movie not available for now.
                    </h3>
                    <p className="text-xs text-[#dce2f7]/40 leading-relaxed px-6">
                      {catalogError}
                    </p>
                    <button
                      onClick={refetchCatalog}
                      className="px-5 py-2.5 bg-[#e50914] text-white font-bold text-xs rounded-xl hover:bg-opacity-95 cursor-pointer transition-all"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredMovies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={() => {
                          setSelectedMovieId(movie.id);
                          setCurrentView('movie-detail');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onWatchlistToggle={() => handleToggleWatchlist(movie.id)}
                        isWatchlisted={watchlist.includes(movie.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-[#141b2b]/40 rounded-3xl border border-white/5 space-y-4 max-w-xl mx-auto">
                    <span className="material-symbols-outlined text-4xl text-[#dce2f7]/30">
                      movie_filter
                    </span>
                    <h3 className="font-display font-bold text-lg text-white">Movie not available for now.</h3>
                    <p className="text-xs text-[#dce2f7]/40 leading-relaxed px-6">
                      We couldn't find any titles matching those specific filter criteria. Adjust your minimum ratings or clear some platforms to try again.
                    </p>
                    <button
                      onClick={() => {
                        setActivePlatforms([]);
                        setSelectedPlatform(null);
                        setActiveContentTypes(['movie', 'tv']);
                        setMinRating(0);
                        setMinYear('');
                        setMaxYear('');
                        setSearchQuery('');
                      }}
                      className="px-5 py-2.5 bg-[#e50914] text-white font-bold text-xs rounded-xl hover:bg-opacity-95 cursor-pointer transition-all"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Platforms List View */}
        {currentView === 'platforms' && (
          <div className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-12 animate-fade-in">
            {/* Page Header */}
            <div className="space-y-2 text-center max-w-xl mx-auto">
              <h1 className="text-3xl font-display font-extrabold text-white">
                Streaming Platform Guides
              </h1>
              <p className="text-sm text-[#dce2f7]/55 leading-relaxed">
                Connect your subscription catalogs, look up licensing content, and discover real-time pricing plans below.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {PLATFORMS.map((platform, idx) => {
                // Let's vary grid size for Bento feel
                const isLarge = idx === 0 || idx === 1; // First two take 3 cols on md+
                const colSpanClass = isLarge ? 'md:col-span-3' : 'md:col-span-2';

                return (
                  <div
                    key={platform.id}
                    onClick={() => handleQuickPlatformFilter(platform.id)}
                    className={`${colSpanClass} glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-64 relative group overflow-hidden`}
                  >
                    {/* Platform Glow background */}
                    <div
                      className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                      style={{ backgroundColor: platform.accentColor }}
                    />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <img
                          src={platform.logoUrl}
                          alt={platform.name}
                          className="h-8 object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">
                          {platform.iconName}
                        </span>
                      </div>

                      <p className="text-xs text-[#dce2f7]/50 leading-relaxed pr-6">
                        {platform.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#dce2f7]/40">Active Titles:</span>
                        <span className="font-mono font-bold text-white">
                          {platform.titleCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/5 rounded px-2 py-0.5 font-bold text-[#dce2f7]/50">
                          {platform.features}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-[#e50914] transition-colors flex items-center gap-0.5">
                          <span>Explore Catalog</span>
                          <span className="material-symbols-outlined text-[14px]">
                            chevron_right
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Movie Detail View */}
        {currentView === 'movie-detail' && movieDetails.loading && (
          <div className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-8 animate-pulse">
            <div className="h-[320px] md:h-[450px] rounded-3xl bg-white/5" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="aspect-[2/3] rounded-2xl bg-white/5" />
              <div className="lg:col-span-2 space-y-5">
                <div className="h-8 w-1/2 bg-white/5 rounded" />
                <div className="h-5 w-2/3 bg-white/5 rounded" />
                <div className="h-28 w-full bg-white/5 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'movie-detail' && !movieDetails.loading && (movieDetails.error || !selectedMovie) && (
          <div className="px-6 md:px-16 w-full max-w-3xl mx-auto text-center py-24 bg-[#141b2b]/40 rounded-3xl border border-white/5 space-y-4 animate-fade-in">
            <span className="material-symbols-outlined text-4xl text-[#dce2f7]/30">error</span>
            <h1 className="font-display font-bold text-xl text-white">Movie not available for now.</h1>
            <p className="text-xs text-[#dce2f7]/40 leading-relaxed px-6">
              {movieDetails.error || 'Movie not available for now.'}
            </p>
            <button
              onClick={movieDetails.refetch}
              className="px-5 py-2.5 bg-[#e50914] text-white font-bold text-xs rounded-xl hover:bg-opacity-95 cursor-pointer transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {currentView === 'movie-detail' && selectedMovie && !movieDetails.loading && !movieDetails.error && (
          <div className="space-y-12 animate-fade-in relative">
            {/* Immersive Backdrop Section */}
            <div className="relative w-full h-[320px] md:h-[450px] overflow-hidden -mt-12">
              <img
                src={selectedMovie.backdropUrl || selectedMovie.posterUrl}
                alt={selectedMovie.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-30"
              />
              {/* Ambient cinematic vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c1322] via-transparent to-[#0c1322]" />

              {/* In-backdrop breadcrumb */}
              <div className="absolute bottom-8 left-6 md:left-16 max-w-7xl mx-auto w-full flex items-center gap-2 text-xs font-semibold text-[#dce2f7]/45">
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-white cursor-pointer"
                >
                  Home
                </button>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <button
                  onClick={() => setCurrentView('explore')}
                  className="hover:text-white cursor-pointer"
                >
                  Explore Catalog
                </button>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="text-white">{selectedMovie.title}</span>
              </div>
            </div>

            {/* Movie Core Info Grid */}
            <div className="px-6 md:px-16 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-24 md:-mt-40 relative z-10">
              {/* Left Column: Poster display with actions */}
              <div className="lg:col-span-1 space-y-6">
                <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-slate-900 shadow-red-950/10">
                  <img
                    src={selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleToggleWatchlist(selectedMovie.id)}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                      watchlist.includes(selectedMovie.id)
                        ? 'bg-[#e50914] border-[#e50914] text-white shadow-xl'
                        : 'bg-[#141b2b] border-white/5 hover:border-white/10 text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {watchlist.includes(selectedMovie.id) ? 'bookmark_added' : 'bookmark'}
                    </span>
                    <span>
                      {watchlist.includes(selectedMovie.id) ? 'Watchlisted' : 'Add Watchlist'}
                    </span>
                  </button>

                  <button
                    onClick={() => setAdvisorOpen(true)}
                    className="w-full py-3.5 bg-[#191f2f] hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-white/5"
                  >
                    <span className="material-symbols-outlined text-sm">chat</span>
                    <span>Ask AI Advisor</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Descriptions & Streaming Availability */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title and Metadata */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-mono font-bold text-[#dce2f7]">
                      {selectedMovie.year}
                    </span>
                    <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-mono font-bold text-[#dce2f7]">
                      {selectedMovie.runtime}
                    </span>
                    <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono font-bold text-[#e50914]">
                      {selectedMovie.rating}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <span className="material-symbols-outlined text-base fill-amber-400">
                        star
                      </span>
                      <span>{selectedMovie.stars.toFixed(1)} IMDB Rating</span>
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
                    {selectedMovie.title}
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {selectedMovie.genres.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-[#141b2b] border border-white/5 rounded-xl text-xs font-semibold text-[#dce2f7]/80"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Synopsis / Plot */}
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-white">Overview</h3>
                  <p className="text-sm md:text-base text-[#dce2f7]/60 leading-relaxed">
                    {selectedMovie.description}
                  </p>
                </div>

                {/* Director & Cast info */}
                {(selectedMovie.director || selectedMovie.cast) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    {selectedMovie.director && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#dce2f7]/30 uppercase tracking-widest block">
                          Director
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {selectedMovie.director}
                        </span>
                      </div>
                    )}
                    {selectedMovie.cast && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#dce2f7]/30 uppercase tracking-widest block">
                          Principal Cast
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {selectedMovie.cast.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Streaming Providers Availability Sections */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#e50914]">live_tv</span>
                    <span>Streaming Offers Indexed Today</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMovie.streamingProviders.map((provider) => (
                      <div
                        key={provider.platform}
                        className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4 group hover:border-[#e50914]/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#141b2b] text-white flex items-center justify-center">
                            {provider.logoUrl ? (
                              <img
                                src={provider.logoUrl}
                                alt={provider.platform}
                                className="h-6 w-6 object-contain rounded"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-lg">
                                {provider.iconName}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{provider.platform}</h4>
                            <p className="text-[10px] text-[#dce2f7]/40 font-semibold uppercase mt-0.5">
                              {provider.type === 'Sub' ? 'Subscription Included' : `Purchase / Rent`} {provider.price && `(${provider.price})`}
                            </p>
                          </div>
                        </div>

                        <a
                          href={provider.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#e50914] text-white text-[11px] font-bold rounded-lg hover:bg-opacity-90 active:scale-95 transition-all text-center flex items-center gap-0.5"
                        >
                          <span>Watch</span>
                          <span className="material-symbols-outlined text-[12px] fill-white">
                            play_arrow
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Similar Movies Section */}
            {movieDetails.data.similar.length > 0 && (
              <section className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-6 pt-12 border-t border-white/5">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-white">More Like This</h3>
                  <p className="text-xs text-[#dce2f7]/40">
                    Cinephile selections with similar genres, style tones, or directors.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {movieDetails.data.similar
                    .map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => handleSimilarMovieClick(movie.id)}
                        className="group bg-[#141b2b] rounded-xl overflow-hidden border border-white/5 hover:border-[#e50914]/20 hover:-translate-y-0.5 transition-all cursor-pointer shadow-xl"
                      >
                        <div className="aspect-[2/3] overflow-hidden bg-slate-900">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <h4 className="font-display font-bold text-xs text-white group-hover:text-[#e50914] transition-colors line-clamp-1">
                            {movie.title}
                          </h4>
                          <div className="flex justify-between items-center text-[10px] text-[#dce2f7]/40">
                            <span>{movie.year}</span>
                            <span className="text-amber-400 font-semibold">★ {movie.stars}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Watchlist View */}
        {currentView === 'watchlist' && (
          <div className="px-6 md:px-16 w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="pb-6 border-b border-white/5">
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
                My Curated Watchlist
              </h1>
              <p className="text-xs text-[#dce2f7]/45">
                Save movies and shows you want to watch next across any subscription catalog.
              </p>
            </div>

            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {watchlist
                  .map((id) => knownMoviesById.get(id))
                  .filter((m): m is Movie => !!m)
                  .map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={() => {
                        setSelectedMovieId(movie.id);
                        setCurrentView('movie-detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onWatchlistToggle={() => handleToggleWatchlist(movie.id)}
                      isWatchlisted={true}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-[#141b2b]/40 rounded-3xl border border-white/5 space-y-4 max-w-xl mx-auto">
                <span className="material-symbols-outlined text-4xl text-[#dce2f7]/30">
                  bookmark
                </span>
                <h3 className="font-display font-bold text-lg text-white">Your Watchlist is Empty</h3>
                <p className="text-xs text-[#dce2f7]/40 leading-relaxed px-12">
                  When browsing the index or using our AI Advisor, click the bookmark icon on any title to save it here for later.
                </p>
                <button
                  onClick={() => setCurrentView('explore')}
                  className="px-5 py-2.5 bg-[#e50914] text-white font-bold text-xs rounded-xl hover:bg-opacity-95 cursor-pointer transition-all inline-block"
                >
                  Browse Streaming Library
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Cinephile Advisor Chat Dialog */}
      <CinephileAdvisor
        isOpen={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        onSelectMovie={(id) => {
          setSelectedMovieId(id);
          setCurrentView('movie-detail');
          setAdvisorOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Shared Footer component */}
      <Footer onNavigate={navigateToView} onToast={showToast} />
    </div>
  );
}
