import React, { useState } from 'react';
import { 
  Camera, 
  Volume2, 
  Wand2, 
  Film, 
  Menu, 
  X, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';
import { OvalVisual } from './components/OvalVisual';
import { OvalSuara } from './components/OvalSuara';
import { OvalDesign } from './components/OvalDesign';
import { OvalAnimasi } from './components/OvalAnimasi';

// Resolusi API Key dari environment runtime atau Vite build
const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'visual' | 'suara' | 'design' | 'animasi'>('visual');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Global Toast State
  const [toast, setToast] = useState({ message: '', isError: false, visible: false });

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const copyTextSafely = (text: string, successMsg = "Berhasil disalin ke clipboard!") => {
    const copyFallback = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) showToast(successMsg);
        else showToast("Gagal menyalin text", true);
      } catch (err) {
        showToast("Gagal menyalin text", true);
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => copyFallback());
    } else {
      copyFallback();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-x-hidden">
      {/* Toast Notification */}
      <div
        className={`fixed bottom-5 right-5 transform transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        } ${
          toast.isError
            ? 'bg-red-900/90 border-red-500/50 text-white'
            : 'bg-slate-800 border-slate-700 text-white'
        } border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[350]`}
      >
        {toast.isError ? (
          <AlertCircle className="text-red-400 shrink-0" size={20} />
        ) : (
          <CheckCircle className="text-green-400 shrink-0" size={20} />
        )}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>

      {/* Header dengan Hamburger Menu */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 min-h-[4.5rem] flex items-center justify-between gap-4 relative z-50">
          <div
            className="flex items-center gap-4 cursor-pointer group shrink-0 z-10"
            onClick={() => setActiveTab('visual')}
          >
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_10px_20px_rgba(138,43,226,0.3)] animate-pulse group-hover:scale-105 transition-transform duration-300"
              viewBox="0 0 300 300"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="40%" stopColor="#3b72ff" />
                  <stop offset="100%" stopColor="#b854ff" />
                </linearGradient>
                <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffb75e" />
                  <stop offset="100%" stopColor="#ed8f03" />
                </linearGradient>
                <linearGradient id="mountGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3c72" />
                  <stop offset="100%" stopColor="#2a5298" />
                </linearGradient>
                <clipPath id="innerRingMask">
                  <ellipse cx="160" cy="150" rx="85" ry="115" transform="rotate(30 160 150)" />
                </clipPath>
              </defs>
              <g stroke="url(#ringGrad)" strokeLinecap="round">
                <line x1="80" y1="110" x2="110" y2="110" strokeWidth="8" />
                <circle cx="70" cy="110" r="4" fill="#4facfe" />
                <line x1="60" y1="125" x2="120" y2="125" strokeWidth="8" />
                <line x1="40" y1="140" x2="115" y2="140" strokeWidth="8" />
                <circle cx="30" cy="140" r="4" fill="#4facfe" />
                <line x1="50" y1="155" x2="120" y2="155" strokeWidth="8" />
                <circle cx="40" cy="155" r="4" fill="#7a60ff" />
                <line x1="70" y1="170" x2="130" y2="170" strokeWidth="8" />
              </g>
              <g clipPath="url(#innerRingMask)">
                <circle cx="185" cy="110" r="18" fill="url(#sunGrad)" />
                <path d="M 90 200 L 150 120 L 190 160 L 220 130 L 260 200 Z" fill="url(#mountGrad)" opacity="0.9" />
                <path d="M 90 200 L 150 120 L 190 160 L 140 200 Z" fill="#2a5298" opacity="0.6" />
              </g>
              <ellipse cx="160" cy="150" rx="85" ry="115" transform="rotate(30 160 150)" fill="none" stroke="url(#ringGrad)" strokeWidth="30" />
              <ellipse
                cx="160"
                cy="150"
                rx="85"
                ry="115"
                transform="rotate(30 160 150)"
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="8"
                strokeDasharray="100 400"
                strokeDashoffset="-150"
              />
            </svg>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black tracking-widest text-white leading-none flex gap-1.5 sm:gap-2">
                <span className="bg-gradient-to-r from-[#4facfe] to-[#b854ff] bg-clip-text text-transparent">OVAL</span>
                <span>STUDIO</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5 w-full">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#8a2be2]"></div>
                <span className="text-[9px] sm:text-[10px] text-[#b854ff] tracking-[0.2em] font-medium uppercase whitespace-nowrap">
                  By Falah
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#8a2be2]"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-[100]">
            <div className="hidden sm:flex text-xs text-slate-400 items-center gap-2 mr-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> App Online
            </div>

            {/* Desktop Navigation Quick Switcher */}
            <div className="hidden md:flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 gap-1">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'visual'
                    ? 'bg-green-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Camera size={14} /> Oval Visual
              </button>
              <button
                onClick={() => setActiveTab('suara')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'suara'
                    ? 'bg-green-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Volume2 size={14} /> Oval Suara
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'design'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Wand2 size={14} /> Oval Design
              </button>
              <button
                onClick={() => setActiveTab('animasi')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'animasi'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Film size={14} /> Oval Animasi
              </button>
            </div>

            {/* Tombol Menu Hamburger (Mobile/Compact) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="relative w-11 h-11 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-white/5 text-white transition-colors flex items-center justify-center cursor-pointer z-[200] shrink-0 outline-none"
              title="Menu Navigasi"
            >
              {isMenuOpen ? <X size={24} className="pointer-events-none" /> : <Menu size={24} className="pointer-events-none" />}
            </button>

            {/* Dropdown Menu Garis Tiga */}
            {isMenuOpen && (
              <div className="absolute right-0 top-14 mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    setActiveTab('visual');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === 'visual'
                      ? 'bg-green-500/10 text-green-400 border-l-4 border-green-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <Camera size={18} /> Oval Visual
                </button>
                <button
                  onClick={() => {
                    setActiveTab('suara');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-t border-white/5 ${
                    activeTab === 'suara'
                      ? 'bg-green-500/10 text-green-400 border-l-4 border-green-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <Volume2 size={18} /> Oval Suara
                </button>
                <button
                  onClick={() => {
                    setActiveTab('design');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-t border-white/5 ${
                    activeTab === 'design'
                      ? 'bg-sky-500/10 text-sky-400 border-l-4 border-sky-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <Wand2 size={18} /> Oval Design
                </button>
                <button
                  onClick={() => {
                    setActiveTab('animasi');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-t border-white/5 ${
                    activeTab === 'animasi'
                      ? 'bg-indigo-500/10 text-indigo-400 border-l-4 border-indigo-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <Film size={18} /> Oval Animasi
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Konten Utama Aplikasi */}
      <div className="flex-grow pb-12">
        <div className={activeTab === 'visual' ? 'block' : 'hidden'}>
          <OvalVisual apiKey={apiKey} showToast={showToast} copyTextSafely={copyTextSafely} />
        </div>

        <div className={activeTab === 'suara' ? 'block' : 'hidden'}>
          <OvalSuara apiKey={apiKey} />
        </div>

        <div className={activeTab === 'design' ? 'block' : 'hidden'}>
          <OvalDesign apiKey={apiKey} showToast={showToast} copyTextSafely={copyTextSafely} />
        </div>

        <div className={activeTab === 'animasi' ? 'block' : 'hidden'}>
          <OvalAnimasi apiKey={apiKey} />
        </div>
      </div>
    </div>
  );
}
