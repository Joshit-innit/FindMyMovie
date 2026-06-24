import React, { useState } from 'react';
import { View } from '../types';

interface FooterProps {
  onNavigate: (view: View) => void;
  onToast: (msg: string) => void;
}

export default function Footer({ onNavigate, onToast }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onToast(`Welcome aboard! Newsletter subscription activated for ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-[#070d1a] border-t border-white/5 pt-16 pb-12 px-6 md:px-16 text-[#dce2f7]/60">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Slogan and Brand Column */}
        <div className="space-y-4">
          <div
            onClick={() => onNavigate('home')}
            className="text-2xl font-display font-black text-[#e50914] uppercase tracking-tighter cursor-pointer flex items-center gap-1 inline-block"
          >
            <span className="material-symbols-outlined text-3xl font-black">movie_filter</span>
            <span>FindMyMovie</span>
          </div>
          <p className="text-sm leading-relaxed text-[#dce2f7]/40">
            Premium cinematic streaming indexer. Explore where to watch any movie or show across 50+ providers instantly.
          </p>
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => onToast('Launching our X/Twitter community!')}
              className="p-2 rounded-lg bg-[#141b2b] hover:bg-[#e50914] hover:text-white transition-colors cursor-pointer"
              title="Twitter / X"
            >
              <span className="material-symbols-outlined text-lg">forum</span>
            </button>
            <button
              onClick={() => onToast('Opening Cinema Stream Guide on YouTube!')}
              className="p-2 rounded-lg bg-[#141b2b] hover:bg-[#e50914] hover:text-white transition-colors cursor-pointer"
              title="YouTube"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
            </button>
            <button
              onClick={() => onToast('Launching sharing workflow...')}
              className="p-2 rounded-lg bg-[#141b2b] hover:bg-[#e50914] hover:text-white transition-colors cursor-pointer"
              title="Share"
            >
              <span className="material-symbols-outlined text-lg">share</span>
            </button>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold font-display text-sm uppercase tracking-wider">
            Explore Content
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('explore')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Browse All Movies
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('platforms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Streaming Platforms
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('watchlist')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                My Curated Watchlist
              </button>
            </li>
          </ul>
        </div>

        {/* Streaming Guides Column */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold font-display text-sm uppercase tracking-wider">
            Streaming Guides
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('explore')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Netflix Complete Index
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('explore')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Disney+ Premium Guide
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('explore')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Prime Video Channels
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('explore')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Criterion Collection Cinephile Selects
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup Column */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold font-display text-sm uppercase tracking-wider">
            Cinephile Digest
          </h4>
          <p className="text-xs text-[#dce2f7]/40 leading-relaxed">
            Get personalized weekly release summaries, streaming pricing alerts, and exclusive editorial picks directly in your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#141b2b] text-sm text-[#dce2f7] rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#e50914] border border-white/5"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#e50914] text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-950/20"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4 max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} FindMyMovie Inc. All rights reserved. Built for cinephiles.</p>
        <div className="flex gap-6">
          <button onClick={() => onToast('Privacy Policy details')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
          <button onClick={() => onToast('Terms of Service details')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
          <button onClick={() => onToast('Cookie Preferences')} className="hover:text-white transition-colors cursor-pointer">Cookie Preferences</button>
        </div>
      </div>
    </footer>
  );
}
