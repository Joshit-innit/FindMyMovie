import { Platform } from './types';

const logoSvg = (label: string, foreground: string, background: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64" role="img" aria-label="${label}">
      <rect width="220" height="64" rx="12" fill="${background}"/>
      <text x="110" y="40" text-anchor="middle" fill="${foreground}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800">${label}</text>
    </svg>`
  )}`;

export const PLATFORMS: Platform[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logoUrl: logoSvg('NETFLIX', '#ffffff', '#e50914'),
    titleCount: 'Browse live catalog',
    description: 'Find movies and shows available from the Netflix catalog through the connected streaming API.',
    features: 'Subscription',
    colorClass: 'bg-[#e50914] shadow-red-900/40 text-white',
    accentColor: '#e50914',
    iconName: 'play_circle',
  },
  {
    id: 'disney',
    name: 'Disney+',
    logoUrl: logoSvg('Disney+', '#ffffff', '#0063be'),
    titleCount: 'Browse live catalog',
    description: 'Explore Disney+ availability from the backend provider index.',
    features: 'Subscription',
    colorClass: 'bg-gradient-to-br from-[#0063be] to-[#002d5d] shadow-blue-950/40 text-white',
    accentColor: '#0063be',
    iconName: 'star',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    logoUrl: logoSvg('prime video', '#ffffff', '#00a8e1'),
    titleCount: 'Browse live catalog',
    description: 'Search Prime Video availability and rental options through the backend.',
    features: 'Sub/Rent/Buy',
    colorClass: 'bg-[#00A8E1] shadow-blue-900/40 text-white',
    accentColor: '#00A8E1',
    iconName: 'shopping_cart',
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    logoUrl: logoSvg('Apple TV+', '#111111', '#ffffff'),
    titleCount: 'Browse live catalog',
    description: 'Look up Apple TV+ titles and watch links returned by the backend.',
    features: 'Subscription',
    colorClass: 'bg-white text-black shadow-slate-900/20',
    accentColor: '#ffffff',
    iconName: 'tv',
  },
  {
    id: 'hbo',
    name: 'HBO Max',
    logoUrl: logoSvg('HBO Max', '#ffffff', '#5e2d91'),
    titleCount: 'Browse live catalog',
    description: 'Browse Max availability from the provider endpoint.',
    features: 'Subscription',
    colorClass: 'bg-[#5e2d91] shadow-purple-900/40 text-white',
    accentColor: '#5e2d91',
    iconName: 'movie_filter',
  },
  {
    id: 'mubi',
    name: 'MUBI',
    logoUrl: logoSvg('MUBI', '#ffffff', '#002b49'),
    titleCount: 'Browse live catalog',
    description: 'Find MUBI availability through the live provider catalog.',
    features: 'Curated',
    colorClass: 'bg-[#002b49] shadow-cyan-900/40 text-white',
    accentColor: '#002b49',
    iconName: 'star',
  },
  {
    id: 'criterion',
    name: 'Criterion Channel',
    logoUrl: logoSvg('Criterion', '#ffffff', '#1c1c1c'),
    titleCount: 'Browse live catalog',
    description: 'Search Criterion Channel availability through the platform endpoint.',
    features: 'Classics',
    colorClass: 'bg-[#1c1c1c] shadow-zinc-900/40 text-white',
    accentColor: '#1c1c1c',
    iconName: 'auto_awesome',
  },
];
