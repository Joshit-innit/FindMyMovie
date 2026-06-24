export type ContentType = 'movie' | 'tv';

export interface Provider {
  platform: string;
  type: 'Sub' | 'Rent' | 'Buy' | 'Free' | string;
  price?: string | null;
  logoUrl?: string | null;
  watchUrl?: string | null;
  region?: string | null;
}

export interface StreamingProvider {
  platform: string;
  type: 'Sub' | 'Rent' | 'Buy' | 'Free';
  price?: string;
  logoUrl?: string;
  iconName: string;
  colorClass: string;
  watchUrl: string;
}

export interface Movie {
  id: string;
  title: string;
  type: ContentType;
  year: number;
  runtime: string;
  rating: string;
  stars: number;
  genres: string[];
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  streamingProviders: StreamingProvider[];
  cast?: string[];
  director?: string;
  language?: string;
  releaseDate?: string;
}

export interface SearchParams {
  title?: string;
  platform?: string;
  language?: string;
  region?: string;
}

export interface ApiMovie {
  id?: string | number;
  movie_id?: string | number;
  title?: string | null;
  name?: string | null;
  poster?: string | null;
  posterUrl?: string | null;
  poster_path?: string | null;
  backdrop?: string | null;
  backdropUrl?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  description?: string | null;
  rating?: string | number | null;
  vote_average?: number | null;
  release_date?: string | null;
  first_air_date?: string | null;
  runtime?: string | number | null;
  language?: string | null;
  original_language?: string | null;
  genres?: Array<string | { name?: string | null }> | string | null;
  providers?: Provider[] | null;
  streamingProviders?: StreamingProvider[] | null;
  type?: ContentType | string | null;
  media_type?: ContentType | string | null;
  cast?: string[] | null;
  director?: string | null;
}

export interface SearchResponse {
  results: ApiMovie[];
}

export interface MovieResponse extends ApiMovie {}

export interface TrendingResponse {
  results: ApiMovie[];
}

export interface PlatformResponse {
  results: ApiMovie[];
}

export interface AdvisorResponse {
  reply: string;
  results: ApiMovie[];
}
