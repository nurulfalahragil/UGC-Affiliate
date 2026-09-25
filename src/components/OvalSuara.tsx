import React, { useState } from 'react';
import { 
  Volume2, 
  MessageSquare, 
  Wand2, 
  PlayCircle, 
  Loader2, 
  Music, 
  Settings2, 
  Gauge, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown 
} from 'lucide-react';
import { INDONESIAN_VOICES, STYLE_PRESETS, SPEED_OPTIONS } from '../constants';
import { base64ToArrayBuffer, pcmToWav } from '../utils/audio';

interface OvalSuaraProps {
  apiKey: string;
}

export const OvalSuara: React.FC<OvalSuaraProps> = ({ apiKey }) => {
  const [script, setScript] = useState('');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(INDONESIAN_VOICES[0].name);
  const [geminiStyle, setGeminiStyle] = useState('Normal');
  const [customGeminiStyle, setCustomGeminiStyle] = useState('');
  const [speechSpeed, setSpeechSpeed] = useState(SPEED_OPTIONS[1]);
  const [notificationTTS, setNotificationTTS] = useState({ type: '', message: '' });

  const charLimit = 3000;

  const handleGenerateAudio = async () => {
    if (!script.trim()) {
      setNotificationTTS({ type: 'error', message: 'Script masih kosong!' });
      return;
    }
    setIsGeneratingTTS(true);
    setAudioUrl(null);
    setNotificationTTS({ type: '', message: '' });

    try {
      const voiceConfig = INDONESIAN_VOICES.find(v => v.name === selectedVoice);
      const apiVoiceId = voiceConfig ? voiceConfig.id : 'Kore';
      let finalPrompt = script;
      let instructions = [];
      let activeStyle = geminiStyle === 'Custom' ? customGeminiStyle : geminiStyle;
      if (activeStyle && activeStyle !== 'Normal' && activeStyle.trim() !== '') {
        instructions.push(`dengan gaya bicara ${activeStyle.toLowerCase()}`);
      }
      if (speechSpeed.value !== 'normal') {
        instructions.push(`dengan tempo ${speechSpeed.value}`);
      }
      if (instructions.length > 0) {
        finalPrompt = `Ucapkan kalimat berikut ${instructions.join(' dan ')}:\n"${script}"`;
      }

      const payload = {
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: apiVoiceId }
            }
          }
        }
      };

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      let result = await response.json();

      if (result.error) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        result = await response.json();
      }

      if (result.error) throw new Error(result.error.message || "Failed to generate audio");
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (audioData) {
        if (mimeType && mimeType.includes("wav")) {
          const buffer = base64ToArrayBuffer(audioData);
          const wavBlob = new Blob([buffer], { type: 'audio/wav' });
          setAudioUrl(URL.createObjectURL(wavBlob));
        } else {
          const sampleRate = parseInt(mimeType?.match(/rate=(\d+)/)?.[1] || "24000", 10);
          const wavBlob = pcmToWav(new Int16Array(base64ToArrayBuffer(audioData)).buffer, sampleRate);
          setAudioUrl(URL.createObjectURL(wavBlob));
        }
        setNotificationTTS({ type: 'success', message: 'Audio berhasil dibuat!' });
        setTimeout(() => {
          const el = document.getElementById('result-audio') as HTMLAudioElement;
          if (el) el.playbackRate = speechSpeed.rate;
        }, 100);
      } else {
        throw new Error("Format audio tidak valid dari API.");
      }
    } catch (error: any) {
      setNotificationTTS({ type: 'error', message: error.message });
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleAIAutoWrite = () => {
    setScript("Halo, selamat datang di Oval Studio. Ini adalah contoh teks yang dihasilkan otomatis untuk kamu coba konversi menjadi suara realistis. Keren kan?");
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Teks to Suara Realistis</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Konversi naskah atau copywriting Anda menjadi suara <em>voiceover</em> berkualitas tinggi berbahasa Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-8">
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-500" />
              <h2 className="font-bold text-sm tracking-wide text-white/90">KONFIGURASI SUARA</h2>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5" /> Narator Suara
                </label>
                <div className="relative">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500/50 appearance-none text-white cursor-pointer"
                  >
                    {INDONESIAN_VOICES.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} - {v.desc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5" /> Tempo / Kecepatan
                </label>
                <div className="flex bg-slate-950 rounded-xl p-1 border border-white/10">
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSpeechSpeed(opt)}
                      className={`flex-1 text-[11px] py-2.5 rounded-lg transition-all font-semibold ${
                        speechSpeed.value === opt.value
                          ? 'bg-green-500 text-slate-950 shadow-md'
                          : 'text-slate-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5" /> Emotion Style
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setGeminiStyle(preset)}
                      className={`text-[10px] uppercase font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        geminiStyle === preset
                          ? 'bg-green-500/20 border-green-500/50 text-green-400 scale-[1.02]'
                          : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                {geminiStyle === 'Custom' && (
                  <div className="mt-3 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="Contoh: Mengantuk dan menguap..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors select-text"
                      value={customGeminiStyle}
                      onChange={(e) => setCustomGeminiStyle(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-white/5 shadow-xl flex flex-col h-[400px]">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/50">
              <span className="font-bold text-xs tracking-widest text-slate-500 flex items-center gap-2">
                <MessageSquare size={14} /> SCRIPT EDITOR
              </span>
              <button
                onClick={handleAIAutoWrite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" /> AI Auto-Write
              </button>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Ketik atau paste script video / copywriting / text Anda di sini..."
                className="w-full h-full bg-transparent resize-none outline-none text-lg leading-relaxed placeholder:text-slate-600 text-white custom-scrollbar transition-colors select-text"
                maxLength={charLimit}
              />
            </div>
            <div className="p-4 bg-slate-950/50 border-t border-white/5 shrink-0 flex flex-col gap-3">
              {notificationTTS.message && (
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm animate-in slide-in-from-bottom-2 ${
                    notificationTTS.type === 'error'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}
                >
                  {notificationTTS.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  )}
                  {notificationTTS.message}
                </div>
              )}
              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingTTS}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  isGeneratingTTS
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-green-500 text-slate-950 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                {isGeneratingTTS ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Mengolah Audio AI...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" /> Generate Suara Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
          {audioUrl && (
            <div className="bg-slate-900 border border-green-500/30 p-6 rounded-3xl animate-in slide-in-from-bottom flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-green-500/10">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30 relative">
                <div className="absolute inset-0 rounded-full border border-green-500/50 animate-ping opacity-20"></div>
                <Music className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1 w-full space-y-4 text-center md:text-left">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg text-white leading-none">Audio Berhasil Dibuat</h3>
                  <p className="text-xs font-medium text-slate-400">
                    {selectedVoice} • Gaya {geminiStyle} • {speechSpeed.label}
                  </p>
                </div>
                <audio id="result-audio" controls src={audioUrl} className="w-full h-10 rounded-full focus:outline-none custom-audio-player"></audio>
              </div>
              <a
                href={audioUrl}
                download={`oval-suara-${Date.now()}.wav`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 text-white font-medium transition-colors shrink-0 w-full md:w-auto justify-center"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
