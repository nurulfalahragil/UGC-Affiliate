import React, { useState } from 'react';
import { 
  ChevronDown, 
  Youtube, 
  Flame, 
  Loader2, 
  Lightbulb, 
  Copy, 
  Sparkles, 
  Terminal, 
  MinusCircle, 
  Wand2, 
  FileText, 
  RefreshCw, 
  Users, 
  Eye, 
  Palette, 
  LayoutGrid, 
  Type, 
  Info 
} from 'lucide-react';

interface OvalDesignProps {
  apiKey: string;
  showToast: (msg: string, isError?: boolean) => void;
  copyTextSafely: (text: string, successMsg?: string) => void;
}

export const OvalDesign: React.FC<OvalDesignProps> = ({ apiKey, showToast, copyTextSafely }) => {
  const [designIdea, setDesignIdea] = useState('');
  const [designAspectRatio, setDesignAspectRatio] = useState('--ar 1:1');
  const [designType, setDesignType] = useState('Infografis');
  const [designActiveTab, setDesignActiveTab] = useState<'prompt' | 'negative' | 'strategy'>('prompt');

  const [isGeneratingYtMeta, setIsGeneratingYtMeta] = useState(false);
  const [ytMetaData, setYtMetaData] = useState<any>(null);
  const [selectedYtTitles, setSelectedYtTitles] = useState<number[]>([0]);

  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [designResult, setDesignResult] = useState<any>(null);

  const handleYtTitleCheck = (index: number) => {
    if (selectedYtTitles.includes(index)) {
      setSelectedYtTitles(selectedYtTitles.filter((i) => i !== index));
    } else {
      setSelectedYtTitles([...selectedYtTitles, index]);
    }
  };

  const generateYoutubeMeta = async () => {
    const idea = designIdea.trim();
    if (idea.length < 10) {
      showToast("Mohon masukkan ide minimal 10 karakter terlebih dahulu.", true);
      return;
    }

    setIsGeneratingYtMeta(true);
    const systemPrompt = `Anda adalah YouTube Strategist dan SEO Expert profesional.
Tugas Anda adalah meriset dan memberikan paket metadata YouTube berdasarkan ide pengguna.
BERIKAN 5 JUDUL VIRAL: Harus clickbait namun relevan, mengundang rasa penasaran, menggunakan huruf kapital pada kata penting, dan emosional.
BERIKAN HOOK UNTUK TIAP JUDUL: Penjelasan visual/emosional mengapa judul ini menarik.
BERIKAN DESKRIPSI: Deskripsi video lengkap yang ramah SEO (3 paragraf singkat).
BERIKAN TAGS: Kata kunci relevan dipisahkan koma.
BERIKAN HASHTAGS: 3-5 hashtag utama.
Output harus dalam Bahasa Indonesia.`;

    const payload = {
      contents: [{ parts: [{ text: `Ide Video: "${idea}"` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            titles: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "Judul YouTube viral." },
                  hook: { type: "STRING", description: "Hook visual/psikologis singkat." }
                },
                required: ["title", "hook"]
              }
            },
            description: { type: "STRING" },
            tags: { type: "STRING" },
            hashtags: { type: "STRING" }
          },
          required: ["titles", "description", "tags", "hashtags"]
        }
      },
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const data = JSON.parse(result.candidates[0].content.parts[0].text);

      setYtMetaData(data);
      setSelectedYtTitles([0]);
      showToast("Metadata YouTube berhasil digenerate!");
    } catch (error) {
      showToast("Gagal menghasilkan metadata. Coba lagi.", true);
    } finally {
      setIsGeneratingYtMeta(false);
    }
  };

  const generateDesignPrompt = async () => {
    const idea = designIdea.trim();
    if (idea.length < 10) {
      showToast("Mohon masukkan ide minimal 10 karakter.", true);
      return;
    }

    let specificContext = "";

    if (designType === 'Thumbnail') {
      if (selectedYtTitles.length === 0 || !ytMetaData) {
        showToast("WAJIB: Klik 'Generate Judul & Metadata SEO' dan ceklist minimal 1 judul!", true);
        return;
      }
      const selectedTitles = selectedYtTitles.map((idx: number) => ytMetaData.titles[idx]);
      specificContext = `\n\n[SANGAT PENTING - MULTIPLE THUMBNAIL YOUTUBE]:
Pengguna telah menceklist ${selectedTitles.length} Judul Video berikut:
${selectedTitles.map((t: any, i: number) => `${i + 1}. Judul: "${t.title}" | Hook: "${t.hook}"`).join('\n')}

-> TUGAS KHUSUS PADA 'professionalPrompt': Anda WAJIB membuatkan prompt text-to-image secara terpisah untuk MASING-MASING judul yang dipilih di atas!
-> Susun 'professionalPrompt' dalam bentuk blok, pisahkan dengan jelas. Contoh Format:

--- 1. PROMPT THUMBNAIL: [Judul 1] ---
[Isi prompt text to image bahasa inggris...]

--- 2. PROMPT THUMBNAIL: [Judul 2] ---
[Isi prompt text to image bahasa inggris...]

-> PASTIKAN Teks Typography yang tertulis besar di dalam gambar masing-masing prompt disesuaikan dengan judulnya.
-> PASTIKAN Visual setiap prompt merepresentasikan Hook-nya masing-masing.`;
    }

    setIsGeneratingDesign(true);
    setDesignResult(null);

    const systemPrompt = `
Anda adalah Oval Design Prompt Engine. Anda bertindak sebagai Senior Graphic Designer, Creative Director, dan AI Prompt Engineer ahli.
Tugas Anda: Mengubah ide sederhana dari pengguna menjadi Prompt Text-to-Image yang sangat profesional, detail, dan siap digunakan pada AI generator (Midjourney, Flux, dll).

ATURAN WAJIB PEMBUATAN PROMPT (Gunakan Bahasa Inggris untuk isi prompt):
Prompt harus mendeskripsikan gambar.
Struktur prompt harus urut: [Main Subject/Concept], [Visual Style], [Layout/Composition], [Typography Direction (gaya font dan isi teks)], [Color Palette], [Lighting], [Graphic Elements], [Quality Tags], [Aspect Ratio].

BAHASA TEKS PADA GAMBAR (SANGAT PENTING):
Meskipun prompt ditulis dalam Bahasa Inggris, SEMUA teks (typography/text overlay) yang akan muncul di dalam gambar HARUS tetap dalam Bahasa Indonesia sesuai ide pengguna. Jangan menerjemahkan pesan/judul ke Bahasa Inggris.
Contoh penulisan di prompt: 
- with bold typography "JUAL BELI BARANG BEKAS"
- text overlay "CARA CEPAT VIRAL"
- infographic layout with Indonesian text "BAHAYA SAMPAH PLASTIK"

BERDASARKAN JENIS DESAIN (PENTING! Sesuaikan elemen dengan jenis ini):
1. Jika "Infografis": Tambahkan keyword: Data visualization, Modern charts, Statistic blocks, Information hierarchy, Educational design, Clean infographic layout, Professional icons, isometric elements, infographic style with readable Indonesian text.
2. Jika "Poster": Tambahkan keyword: Hero visual, Eye-catching composition, Promotional layout, Modern poster composition, Professional branding, Strong focal point, poster design with clear Indonesian typography.
3. Jika "Banner": Tambahkan keyword: Advertising banner design, Marketing layout, Promotional elements, Attention grabbing visuals, ultra wide composition (if landscape), commercial advertisement with bold Indonesian text.
4. Jika "Thumbnail": Tambahkan keyword: High CTR thumbnail style, Viral youtube style, Strong emotional impact, Click-worthy composition, Large readable typography element in Indonesian, Eye-catching contrast, vibrant colors. JIKA diberikan Judul dan Hook spesifik, GAMBAR HARUS MEREFLEKSIKANNYA 100%.

QUALITY TAGS WAJIB ADA:
ultra detailed, professional graphic design, award winning design, high quality, 8k resolution, premium layout, sharp focus, commercial advertising quality, behance style, dribbble trending.

PANDUAN NEGATIVE PROMPT:
Berikan negative prompt komprehensif dalam bahasa inggris yang mencegah hasil buruk, menyesuaikan jenis desain. Selalu sertakan: low quality, blurry, pixelated, bad typography, cropped text, poor composition, watermark, messy layout.

STRATEGI DESAIN:
Berikan penjelasan singkat (dalam Bahasa Indonesia) tentang mengapa prompt tersebut disusun demikian, dibagi menjadi 5 kategori strategi.
`;

    const userQuery = `Ide Desain: "${idea}"\nJenis Desain: ${designType}\nAspect Ratio yang diinginkan: ${designAspectRatio}${specificContext}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            professionalPrompt: { type: "STRING", description: "The highly detailed, english text-to-image prompt ending with the aspect ratio parameter." },
            negativePrompt: { type: "STRING", description: "Comma separated negative tags in english." },
            strategyTargetAudience: { type: "STRING", description: "Target audience analysis in Indonesian." },
            strategyVisualApproach: { type: "STRING", description: "Visual approach explanation in Indonesian." },
            strategyColorStrategy: { type: "STRING", description: "Color choices explanation in Indonesian." },
            strategyLayoutStrategy: { type: "STRING", description: "Layout and composition strategy in Indonesian." },
            strategyTypographyStrategy: { type: "STRING", description: "Typography direction explanation in Indonesian." }
          },
          required: [
            "professionalPrompt",
            "negativePrompt",
            "strategyTargetAudience",
            "strategyVisualApproach",
            "strategyColorStrategy",
            "strategyLayoutStrategy",
            "strategyTypographyStrategy"
          ]
        }
      },
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      const data = JSON.parse(result.candidates[0].content.parts[0].text);

      if (!data.professionalPrompt.includes(designAspectRatio)) {
        data.professionalPrompt += ` ${designAspectRatio}`;
      }
      const baseNegative = "low quality, blurry, pixelated, bad typography, cropped text, poor composition, watermark, duplicate objects, overexposed, underexposed, messy layout, distorted graphics, text overlay error";
      data.negativePrompt = data.negativePrompt.length > 10 ? data.negativePrompt + ", " + baseNegative : baseNegative;

      setDesignResult(data);
      setDesignActiveTab('prompt');
      showToast("Prompt berhasil dibuat!");
    } catch (error) {
      showToast("Terjadi kesalahan saat menghubungi AI Engine.", true);
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  const exportDesignToTxt = () => {
    if (!designResult) return;
    const content = `OVAL DESIGN PROMPT GENERATOR
=============================
Ide Asli:
${designIdea}

Parameter:
Aspect Ratio: ${designAspectRatio}
Jenis Desain: ${designType}

=============================
PROFESSIONAL PROMPT:
${designResult.professionalPrompt}

=============================
NEGATIVE PROMPT:
${designResult.negativePrompt}

=============================
DESIGN STRATEGY:
- Target Audience: ${designResult.strategyTargetAudience}
- Visual Approach: ${designResult.strategyVisualApproach}
- Color Strategy: ${designResult.strategyColorStrategy}
- Layout Strategy: ${designResult.strategyLayoutStrategy}
- Typography Strategy: ${designResult.strategyTypographyStrategy}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `OvalPrompt_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File berhasil diexport!");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          Oval <span className="text-sky-400 font-light">Design Prompt</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Mesin AI untuk menyusun instruksi visual tingkat desainer profesional, siap digunakan untuk Image Generator terbaik Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Kiri: Input */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">1</span>
              <h2 className="text-lg font-bold text-white">Masukkan Ide Desain</h2>
            </div>
            <label className="block text-xs font-medium text-slate-400 mb-3">
              Deskripsikan visual yang ingin Anda buat secara sederhana.
            </label>
            <textarea
              rows={5}
              value={designIdea}
              onChange={(e) => setDesignIdea(e.target.value.substring(0, 5000))}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none select-text"
              placeholder="Contoh:&#10;Poster PPDB SD Negeri 4 Weding&#10;Banner Jual Beli Barang Bekas&#10;Thumbnail Youtube Cara Cepat Viral..."
            ></textarea>
            <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-3 px-1">
              <span>Minimal 10 karakter</span>
              <span className={designIdea.length >= 5000 ? 'text-red-400' : ''}>{designIdea.length} / 5000</span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">2</span>
              <h2 className="text-lg font-bold text-white">Pilih Aspect Ratio</h2>
            </div>
            <div className="relative">
              <select
                value={designAspectRatio}
                onChange={(e) => setDesignAspectRatio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors font-medium cursor-pointer"
              >
                <optgroup label="Sosial Media" className="bg-slate-900">
                  <option value="--ar 1:1">1:1 Square (Feed)</option>
                  <option value="--ar 4:5">4:5 Instagram Portrait</option>
                  <option value="--ar 9:16">9:16 Story/Reels/Tiktok</option>
                  <option value="--ar 16:9">16:9 Youtube Thumbnail</option>
                  <option value="--ar 3:4">3:4 Poster Portrait</option>
                  <option value="--ar 4:3">4:3 Landscape</option>
                </optgroup>
                <optgroup label="Cetak / Print" className="bg-slate-900">
                  <option value="--ar 1:1.414 (A4 Portrait)">A4 Portrait</option>
                  <option value="--ar 1.414:1 (A4 Landscape)">A4 Landscape</option>
                  <option value="--ar 1:1.5 (F4 Portrait)">F4 Portrait</option>
                  <option value="--ar 1.5:1 (F4 Landscape)">F4 Landscape</option>
                  <option value="--ar 1:1.414 (A3 Portrait)">A3 Portrait</option>
                  <option value="--ar 1.414:1 (A3 Landscape)">A3 Landscape</option>
                </optgroup>
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl flex-grow transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0">3</span>
              <h2 className="text-lg font-bold text-white">Jenis Desain</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { type: 'Infografis', icon: '📊', desc: 'Visual edukatif dengan data & struktur.' },
                { type: 'Poster', icon: '🖼️', desc: 'Desain promosi & fokus pesan utama.' },
                { type: 'Banner', icon: '📢', desc: 'Headline kuat & penarik perhatian.' },
                { type: 'Thumbnail', icon: '▶️', desc: 'Visual Youtube CTR tinggi & memancing klik.' }
              ].map((item) => (
                <div
                  key={item.type}
                  onClick={() => {
                    setDesignType(item.type);
                    if (item.type === 'Thumbnail') setDesignAspectRatio('--ar 16:9');
                  }}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 ${
                    designType === item.type
                      ? 'bg-sky-500/10 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.15)] border-2'
                      : 'bg-slate-800/40 border border-slate-700 hover:bg-slate-800/80 hover:border-sky-500/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-white mb-1">{item.type}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* THUMBNAIL EXTRAS */}
            {designType === 'Thumbnail' && (
              <div className="mt-6 pt-5 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center mb-3">
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                    <Youtube size={18} className="text-red-500 fill-current" /> YouTube Viral Kit
                  </h3>
                </div>
                <p className="text-[11px] font-medium text-slate-400 mb-4 leading-relaxed">
                  Dapatkan 5 ide judul viral dan metadata SEO sebelum membuat prompt gambar agar hasilnya relevan.
                </p>

                <button
                  onClick={generateYoutubeMeta}
                  disabled={isGeneratingYtMeta}
                  className="w-full bg-slate-950 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-400 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingYtMeta ? <Loader2 size={18} className="animate-spin" /> : <Flame size={18} />}
                  <span>{isGeneratingYtMeta ? 'Menganalisis SEO...' : 'Generate Judul & Metadata SEO'}</span>
                </button>

                {ytMetaData && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 mt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Pilih Judul (Bisa Lebih Dari Satu)
                      </label>
                      <div className="space-y-2">
                        {ytMetaData.titles.map((item: any, index: number) => {
                          const isChecked = selectedYtTitles.includes(index);
                          return (
                            <label
                              key={index}
                              className={`flex p-3 sm:p-4 border rounded-xl cursor-pointer transition-all items-start gap-3 group ${
                                isChecked ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-900 hover:border-red-500/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleYtTitleCheck(index)}
                                className="mt-1 w-4 h-4 accent-red-500 rounded cursor-pointer shrink-0"
                              />
                              <div className="min-w-0">
                                <div className={`font-bold text-sm mb-1.5 transition-colors ${isChecked ? 'text-white' : 'text-slate-300 group-hover:text-red-100'}`}>
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-sky-400 bg-sky-500/10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-sky-500/20 font-medium">
                                  <Lightbulb size={12} /> Hook: {item.hook}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deskripsi Lengkap</label>
                        <button onClick={() => copyTextSafely(ytMetaData.description)} className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 h-28 overflow-y-auto font-mono whitespace-pre-wrap custom-scrollbar select-text">
                        {ytMetaData.description}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tags & Hashtags (SEO)</label>
                        <button onClick={() => copyTextSafely(`${ytMetaData.tags}\n\n${ytMetaData.hashtags}`)} className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <div className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 h-24 overflow-y-auto font-mono whitespace-pre-wrap custom-scrollbar select-text">
                        {ytMetaData.tags}
                        <br />
                        <br />
                        {ytMetaData.hashtags}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={generateDesignPrompt}
            disabled={isGeneratingDesign}
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-lg disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGeneratingDesign ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} className="group-hover:animate-pulse" />}
            <span>{isGeneratingDesign ? 'Meracik Prompt AI...' : 'Generate Professional Prompt'}</span>
          </button>
        </div>

        {/* Panel Kanan: Hasil */}
        <div className="lg:col-span-7 flex flex-col h-full mt-6 lg:mt-0">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl flex flex-col h-[600px] lg:h-full overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 bg-slate-900">
              <button
                onClick={() => setDesignActiveTab('prompt')}
                className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  designActiveTab === 'prompt' ? 'text-white border-b-2 border-sky-500 bg-white/5' : 'text-slate-500 border-b-2 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Terminal size={16} /> Professional Prompt
              </button>
              <button
                onClick={() => setDesignActiveTab('negative')}
                className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  designActiveTab === 'negative' ? 'text-white border-b-2 border-red-500 bg-white/5' : 'text-slate-500 border-b-2 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <MinusCircle size={16} /> Negative Prompt
              </button>
              <button
                onClick={() => setDesignActiveTab('strategy')}
                className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  designActiveTab === 'strategy' ? 'text-white border-b-2 border-green-500 bg-white/5' : 'text-slate-500 border-b-2 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Lightbulb size={16} /> Design Strategy
              </button>
            </div>

            <div className="flex-grow p-6 relative bg-slate-950">
              {!designResult && !isGeneratingDesign && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Wand2 size={64} className="text-slate-800 mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Menunggu Ide Brilian Anda</h3>
                  <p className="text-sm max-w-xs font-medium">Masukkan ide desain di panel kiri dan klik Generate untuk melihat keajaiban AI.</p>
                </div>
              )}

              {isGeneratingDesign && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10">
                  <div className="w-12 h-12 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-sky-400 font-bold text-lg animate-pulse">Menyusun Prompt Profesional...</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium">AI sedang menganalisis komposisi, warna, dan tipografi.</p>
                </div>
              )}

              {designResult && !isGeneratingDesign && (
                <div className="h-full relative w-full overflow-hidden">
                  {designActiveTab === 'prompt' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-full relative group animate-in fade-in flex flex-col">
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button
                          onClick={() => copyTextSafely(designResult.professionalPrompt)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-md"
                          title="Copy Prompt"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 shrink-0">Generated Prompt (English)</h4>
                      <div className="overflow-y-auto flex-1 pr-2 text-slate-200 text-sm leading-relaxed font-mono whitespace-pre-wrap custom-scrollbar select-text">
                        {designResult.professionalPrompt}
                      </div>
                    </div>
                  )}

                  {designActiveTab === 'negative' && (
                    <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-5 h-full relative group animate-in fade-in flex flex-col">
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button
                          onClick={() => copyTextSafely(designResult.negativePrompt)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-md"
                          title="Copy Negative Prompt"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-4 shrink-0">Negative Prompt</h4>
                      <div className="overflow-y-auto flex-1 pr-2 text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap custom-scrollbar pb-14 select-text">
                        {designResult.negativePrompt}
                      </div>
                      <div className="absolute bottom-5 left-5 right-5 text-xs font-medium text-slate-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2 shadow-inner">
                        <Info size={16} className="text-red-400 shrink-0" /> Gunakan parameter ini untuk memfilter hasil visual yang buruk pada AI Generator Anda.
                      </div>
                    </div>
                  )}

                  {designActiveTab === 'strategy' && (
                    <div className="overflow-y-auto h-full pr-2 space-y-4 custom-scrollbar animate-in fade-in pb-4">
                      {[
                        { icon: <Users />, title: "Target Audience", desc: designResult.strategyTargetAudience },
                        { icon: <Eye />, title: "Visual Approach", desc: designResult.strategyVisualApproach },
                        { icon: <Palette />, title: "Color Strategy", desc: designResult.strategyColorStrategy },
                        { icon: <LayoutGrid />, title: "Layout & Composition", desc: designResult.strategyLayoutStrategy },
                        { icon: <Type />, title: "Typography Direction", desc: designResult.strategyTypographyStrategy }
                      ].map((strat, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 text-sky-400 bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20 shadow-inner">
                              {React.cloneElement(strat.icon as React.ReactElement<any>, { size: 20 })}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-white mb-1.5">{strat.title}</h5>
                              <p className="text-[13px] text-slate-400 leading-relaxed font-medium select-text">{strat.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            {designResult && !isGeneratingDesign && (
              <div className="border-t border-slate-800 bg-slate-900 p-5 flex flex-wrap gap-3 justify-end shrink-0">
                <button
                  onClick={exportDesignToTxt}
                  className="px-5 py-2.5 text-sm font-bold rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-2 shadow-md"
                >
                  <FileText size={16} /> Export TXT
                </button>
                <button
                  onClick={generateDesignPrompt}
                  className="px-5 py-2.5 text-sm font-bold rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition-all flex items-center gap-2 shadow-md"
                >
                  <RefreshCw size={16} /> Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
