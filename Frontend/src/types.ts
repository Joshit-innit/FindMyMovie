export type View = 'home' | 'platforms' | 'movie-detail' | 'explore' | 'watchlist' | 'about';

export type {
  ApiMovie,
  AdvisorResponse,
  ContentType,
  Movie,
  MovieResponse,
  PlatformResponse,
  Provider,
  SearchParams,
  SearchResponse,
  StreamingProvider,
  TrendingResponse,
} from './types/movie';

export interface Platform {
  id: string;
  name: string;
  logoUrl: string;
  titleCount: string;
  description: string;
  features: string;
  colorClass: string;
  accentColor: string;
  iconName: string;
}
