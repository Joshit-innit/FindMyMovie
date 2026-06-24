import React, { useState, useRef, useEffect } from 'react';
import { Movie } from '../types';
import { askAdvisor } from '../services/api';

interface CinephileAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (id: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  suggestedMovies?: Movie[];
}

export default function CinephileAdvisor({
  isOpen,
  onClose,
  onSelectMovie,
}: CinephileAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi there! I am AIDA, your Cinephile AI Assistant. 🎬 Let me know what you are in the mood for! Tell me a genre, actor, director, or vibe (e.g. 'cyberpunk with Ryan Gosling', 'family-friendly sci-fi', or 'space thriller') and I will locate the best matches!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const advisorResponse = await askAdvisor(userText);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: advisorResponse.reply,
          suggestedMovies: advisorResponse.movies,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: error instanceof Error ? error.message : 'Movie not available for now.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm md:max-w-md h-[550px] bg-[#0c1322] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-[#141b2b] px-5 py-4 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-display font-bold text-sm text-white">AIDA Cinephile Advisor</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#dce2f7]/60 hover:text-white cursor-pointer active:scale-90"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-[#0c1322] to-[#070e1c]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#e50914] text-white rounded-br-none'
                  : 'bg-[#191f2f] text-[#dce2f7] rounded-bl-none border border-white/5'
              }`}
            >
              {msg.text}
            </div>

            {/* Suggested Movies list inside chat */}
            {msg.suggestedMovies && msg.suggestedMovies.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-3 w-full">
                {msg.suggestedMovies.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMovie(m.id)}
                    className="bg-[#141b2b] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-[#e50914]/40 hover:-translate-y-0.5 transition-all p-2 text-left"
                  >
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="aspect-[4/3] w-full object-cover rounded-lg mb-2"
                      referrerPolicy="no-referrer"
                    />
                    <h5 className="font-display font-bold text-[11px] text-white line-clamp-1">
                      {m.title}
                    </h5>
                    <div className="flex justify-between items-center text-[9px] text-[#dce2f7]/40 mt-1">
                      <span>{m.year}</span>
                      <span className="text-amber-400 font-semibold">★ {m.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 bg-[#191f2f] border border-white/5 rounded-full px-4 py-2 w-max text-xs text-[#dce2f7]/50">
            <span className="w-1.5 h-1.5 bg-[#dce2f7]/50 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#dce2f7]/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-[#dce2f7]/50 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-[#141b2b] border-t border-white/5 p-3 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder="Ask e.g. 'scifi movies like Interstellar'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#0c1322] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#dce2f7] focus:outline-none focus:ring-1 focus:ring-[#e50914]"
        />
        <button
          type="submit"
          className="p-2.5 bg-[#e50914] text-white rounded-xl hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  );
}
