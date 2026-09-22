'use client';
// ============================================================================
// Prime Video Page — /prime-video
// Sleek, cinematic dark Amazon Prime Video streaming showcase with trailers & watchlists
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Plus,
  Check,
  Info,
  Volume2,
  VolumeX,
  Star,
  ChevronRight,
  Sparkles,
  Film,
  Tv,
  X,
  Award,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLocation } from '@/context/LocationContext';

interface VideoTitle {
  id: string;
  title: string;
  category: 'Movie' | 'Series';
  genre: string;
  year: number;
  rating: string; // e.g. '16+', '18+', 'U/A'
  duration: string; // e.g. '2h 14m' or '3 Seasons'
  matchScore: number;
  description: string;
  banner: string;
  poster: string;
  badge?: string;
  trailerUrl?: string;
}

const FEATURED_HERO: VideoTitle = {
  id: 'pv-rings-of-power',
  title: 'The Lord of the Rings: The Rings of Power',
  category: 'Series',
  genre: 'Action, Fantasy, Adventure',
  year: 2024,
  rating: '16+',
  duration: 'Season 2 Now Streaming',
  matchScore: 98,
  description:
    'Sauron has returned. Cast out by Galadriel, without army or ally, the rising Dark Lord must now rely on his own cunning to rebuild his strength and oversee the creation of the Rings of Power.',
  banner:
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
  poster:
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
  badge: 'Amazon Original',
};

const PRIME_ORIGINALS: VideoTitle[] = [
  {
    id: 'pv-reacher',
    title: 'Reacher',
    category: 'Series',
    genre: 'Action, Crime, Thriller',
    year: 2024,
    rating: '18+',
    duration: '2 Seasons',
    matchScore: 97,
    description:
      'When former military police investigator Jack Reacher is arrested for a murder he did not commit, he finds himself in the middle of a deadly conspiracy.',
    banner: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&auto=format&fit=crop&q=80',
    badge: 'Top 10',
  },
  {
    id: 'pv-the-boys',
    title: 'The Boys',
    category: 'Series',
    genre: 'Action, Comedy, Sci-Fi',
    year: 2024,
    rating: '18+',
    duration: 'Season 4',
    matchScore: 99,
    description:
      'A fun and irreverent take on what happens when superheroes abuse their superpowers rather than use them for good.',
    banner: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&auto=format&fit=crop&q=80',
    badge: 'Popular',
  },
  {
    id: 'pv-citadel',
    title: 'Citadel',
    category: 'Series',
    genre: 'Espionage, Action, Drama',
    year: 2023,
    rating: '16+',
    duration: '1 Season',
    matchScore: 94,
    description:
      'Eight years ago, Citadel fell. The independent global spy agency was destroyed by Manticore. Now, two elite agents must piece together their erased memories.',
    banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80',
    badge: 'Global Hit',
  },
  {
    id: 'pv-fallout',
    title: 'Fallout',
    category: 'Series',
    genre: 'Sci-Fi, Adventure, Action',
    year: 2024,
    rating: '18+',
    duration: 'Season 1',
    matchScore: 99,
    description:
      'In a future post-apocalyptic Los Angeles, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    badge: 'Emmy Winner',
  },
  {
    id: 'pv-mirzapur',
    title: 'Mirzapur',
    category: 'Series',
    genre: 'Crime, Drama, Thriller',
    year: 2024,
    rating: '18+',
    duration: 'Season 3',
    matchScore: 96,
    description:
      'The iron-fisted Akhandanand Tripathi is a millionaire carpet exporter and the mafia don of Mirzapur.',
    banner: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80',
    badge: '#1 in India',
  },
];

const BLOCKBUSTER_MOVIES: VideoTitle[] = [
  {
    id: 'pv-oppenheimer',
    title: 'Oppenheimer',
    category: 'Movie',
    genre: 'Biography, Drama, History',
    year: 2023,
    rating: '16+',
    duration: '3h 00m',
    matchScore: 98,
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    banner: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&auto=format&fit=crop&q=80',
    badge: 'Oscar Winner',
  },
  {
    id: 'pv-interstellar',
    title: 'Interstellar',
    category: 'Movie',
    genre: 'Sci-Fi, Adventure, Drama',
    year: 2014,
    rating: '13+',
    duration: '2h 49m',
    matchScore: 99,
    description:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet.',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    badge: 'Fan Favorite',
  },
  {
    id: 'pv-dune-2',
    title: 'Dune: Part Two',
    category: 'Movie',
    genre: 'Sci-Fi, Action, Adventure',
    year: 2024,
    rating: '13+',
    duration: '2h 46m',
    matchScore: 97,
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    banner: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80',
    badge: 'Top Rated',
  },
  {
    id: 'pv-top-gun',
    title: 'Top Gun: Maverick',
    category: 'Movie',
    genre: 'Action, Drama',
    year: 2022,
    rating: '13+',
    duration: '2h 10m',
    matchScore: 96,
    description:
      'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN elite graduates.',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    badge: 'Blockbuster',
  },
];

export default function PrimeVideoPage() {
  const { country } = useLocation();
  const [watchlist, setWatchlist] = useState<string[]>(['pv-reacher']);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv' | 'originals'>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoTitle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePlay = (video: VideoTitle) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  return (
    <MainLayout>
      <div className="bg-[#0b0e14] text-white min-h-screen pb-20">
        {/* ── Sub Navigation Strip ── */}
        <div className="bg-[#10141e]/90 backdrop-blur-md border-b border-gray-800 sticky top-16 z-20 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between py-2.5">
            <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
              <span className="text-[#00a8e1] font-extrabold text-base flex items-center gap-1">
                prime video
              </span>
              <button
                onClick={() => setActiveTab('all')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'all' ? 'text-white border-b-2 border-[#00a8e1] pb-1' : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('movies')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'movies' ? 'text-white border-b-2 border-[#00a8e1] pb-1' : 'text-gray-400 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setActiveTab('tv')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'tv' ? 'text-white border-b-2 border-[#00a8e1] pb-1' : 'text-gray-400 hover:text-white'
                }`}
              >
                TV Shows
              </button>
              <button
                onClick={() => setActiveTab('originals')}
                className={`transition-colors cursor-pointer ${
                  activeTab === 'originals' ? 'text-white border-b-2 border-[#00a8e1] pb-1' : 'text-gray-400 hover:text-white'
                }`}
              >
                Amazon Originals
              </button>
            </div>

            <div className="text-xs text-gray-400 hidden md:flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Included with your Prime membership ({country.name})</span>
            </div>
          </div>
        </div>

        {/* ── Hero Billboard ── */}
        <div className="relative h-[480px] sm:h-[550px] w-full overflow-hidden">
          {/* Background Image with Gradient Overlay */}
          <Image
            src={FEATURED_HERO.banner}
            alt={FEATURED_HERO.title}
            fill
            priority
            className="object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/60 to-transparent" />

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end pb-16 px-4 sm:px-8">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-[#00a8e1] text-gray-900 font-extrabold px-2 py-0.5 rounded text-[11px]">
                  PRIME
                </span>
                <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px]">
                  {FEATURED_HERO.badge}
                </span>
                <span className="text-gray-400 font-medium">· {FEATURED_HERO.genre}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {FEATURED_HERO.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                <span className="text-green-400 font-bold">{FEATURED_HERO.matchScore}% Match</span>
                <span>{FEATURED_HERO.year}</span>
                <span className="border border-gray-600 px-1.5 py-0.5 rounded text-[10px] text-gray-300">
                  {FEATURED_HERO.rating}
                </span>
                <span>{FEATURED_HERO.duration}</span>
                <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] text-gray-300">UHD · HDR</span>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                {FEATURED_HERO.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePlay(FEATURED_HERO)}
                  className="bg-[#00a8e1] hover:bg-[#0092c4] text-gray-950 font-bold px-6 py-2.5 rounded-md text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Play size={18} className="fill-current" />
                  <span>Watch with Prime</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlay(FEATURED_HERO)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-md text-sm border border-white/20 backdrop-blur-md flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Film size={16} />
                  <span>Watch Trailer</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWatchlist(FEATURED_HERO.id)}
                  className={`p-2.5 rounded-md border text-sm backdrop-blur-md transition-colors cursor-pointer ${
                    watchlist.includes(FEATURED_HERO.id)
                      ? 'bg-green-700/40 border-green-500 text-green-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title="Add to Watchlist"
                >
                  {watchlist.includes(FEATURED_HERO.id) ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content Sections ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 -mt-6 relative z-10">
          {/* Section 1: Amazon Original Series */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Amazon Originals &amp; Exclusives</span>
                <ChevronRight size={18} className="text-[#00a8e1]" />
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {PRIME_ORIGINALS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePlay(item)}
                  className="group relative rounded-md overflow-hidden bg-gray-900 border border-gray-800 hover:border-[#00a8e1] transition-all cursor-pointer hover:scale-105 duration-200 shadow-md"
                >
                  <div className="relative h-44 sm:h-52 w-full">
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                    {item.badge && (
                      <span className="absolute top-2 left-2 bg-[#00a8e1] text-gray-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                        {item.badge}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-[#00a8e1] text-white hover:text-black transition-colors"
                    >
                      {watchlist.includes(item.id) ? <Check size={13} /> : <Plus size={13} />}
                    </button>
                  </div>

                  <div className="p-2.5 bg-gray-950">
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-[#00a8e1]">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                      <span className="text-green-400 font-semibold">{item.matchScore}% Match</span>
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Blockbuster Movies */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Top Rated Movies in {country.name}</span>
                <ChevronRight size={18} className="text-[#00a8e1]" />
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {BLOCKBUSTER_MOVIES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePlay(item)}
                  className="group relative rounded-md overflow-hidden bg-gray-900 border border-gray-800 hover:border-[#00a8e1] transition-all cursor-pointer hover:scale-[1.02] duration-200"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.banner}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-[#00a8e1] flex items-center justify-center shadow-lg text-gray-950">
                        <Play size={22} className="fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-950">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                      <span className="text-[#00a8e1] font-bold">Prime</span>
                      <span>·</span>
                      <span>{item.year}</span>
                      <span>·</span>
                      <span>{item.duration}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#00a8e1] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Video Player Modal ── */}
        {isPlaying && selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-gray-950 rounded-xl overflow-hidden border border-gray-800 shadow-2xl relative">
              <div className="flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="bg-[#00a8e1] text-gray-950 font-extrabold px-2 py-0.5 rounded text-xs">
                    PRIME VIDEO
                  </span>
                  <span className="font-bold text-sm text-white truncate">{selectedVideo.title}</span>
                </div>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="rounded p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video Screen Simulation */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <Image
                  src={selectedVideo.banner}
                  alt={selectedVideo.title}
                  fill
                  className="object-cover opacity-50"
                />
                <div className="relative z-10 text-center space-y-4 px-6">
                  <div className="w-16 h-16 rounded-full bg-[#00a8e1] flex items-center justify-center mx-auto shadow-2xl text-gray-950 animate-pulse">
                    <Play size={28} className="fill-current ml-1" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Streaming Trailer</h3>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    {selectedVideo.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-900 flex items-center justify-between text-xs text-gray-400">
                <span>Audio: English [Original], Hindi, Tamil, Telugu · Subtitles: English</span>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-1.5 rounded transition-colors"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
