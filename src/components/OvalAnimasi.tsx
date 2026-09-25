import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  Trash2, 
  User, 
  Map, 
  Paintbrush, 
  BookOpen, 
  Layers, 
  Smartphone, 
  Monitor, 
  Square, 
  Mic, 
  Volume2, 
  RefreshCw, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  Tv, 
  ImageIcon, 
  Pencil, 
  Download, 
  Play, 
  Pause, 
  Copy, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Wand2,
  Video
} from 'lucide-react';
import { ANIMATION_VISUAL_OPTIONS, ANIMATION_NARRATIVE_OPTIONS } from '../constants';
import { fetchWithRetry, parseFlexibleJSON, decodeAudioData } from '../utils/audio';

interface OvalAnimasiProps {
  apiKey: string;
}

export const OvalAnimasi: React.FC<OvalAnimasiProps> = ({ apiKey }) => {
  const [step1_Idea, setStep1_Idea] = useState('Petualangan Andi mencari buku ajaib yang bisa bicara di perpustakaan.');
  const [step2_Character, setStep2_Character] = useState('Andi (10 tahun), anak laki-laki, rambut pendek hitam, mata coklat besar, memakai kaos merah dan ransel kuning.');
  const [step2_Environment, setStep2_Environment] = useState('Perpustakaan tua bergaya klasik, rak kayu tinggi penuh buku, cahaya matahari masuk dari jendela besar, berdebu magis.');
  const [step3_Visual, setStep3_Visual] = useState('Pixar 3D Animation');
  const [step4_Narrative, setStep4_Narrative] = useState('Storytelling (Hero Journey)');
  const [step5_SceneCount, setStep5_SceneCount] = useState(4);
  const [step6_AspectRatio, setStep6_AspectRatio] = useState('16:9');
  const [step7_VoiceGender, setStep7_VoiceGender] = useState('Laki-laki Berwibawa');
  const [step8_VOType, setStep8_VOType] = useState('Full Narator');

  const [customVisual, setCustomVisual] = useState('');
  const [customNarrative, setCustomNarrative] = useState('');

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingLocks, setIsGeneratingLocks] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const [animasiError, setAnimasiError] = useState<string | null>(null);

  const [generatingImages, setGeneratingImages] = useState<any>({});
  const [generatedImages, setGeneratedImages] = useState<any>({});
  const [generatingAudio, setGeneratingAudio] = useState<any>({});
  const [generatedAudio, setGeneratedAudio] = useState<any>({});

  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const animasiAudioRefs = useRef<any>({});

  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [currentCinemaScene, setCurrentCinemaScene] = useState(0);

  const [editingImagePrompt, setEditingImagePrompt] = useState<number | null>(null);
  const [tempImagePrompt, setTempImagePrompt] = useState("");

  const [animasiToastMessage, setAnimasiToastMessage] = useState<string | null>(null);

  const showAnimasiToast = (msg: string) => {
    setAnimasiToastMessage(msg);
    setTimeout(() => setAnimasiToastMessage(null), 4000);
  };

  const processImageRatio = (base64: string, ratioString: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);

        const [rw, rh] = ratioString.split(':').map(Number);
        const targetAspect = rw / rh;
        const imgAspect = img.width / img.height;

        let drawW = img.width;
        let drawH = img.height;
        let offsetX = 0;
        let offsetY = 0;

        if (Math.abs(imgAspect - targetAspect) > 0.01) {
          if (imgAspect > targetAspect) {
            drawW = img.height * targetAspect;
            offsetX = (img.width - drawW) / 2;
          } else {
            drawH = img.width / targetAspect;
            offsetY = (img.height - drawH) / 2;
          }
        }

        canvas.width = drawW;
        canvas.height = drawH;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH, 0, 0, drawW, drawH);
        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const generateConsistentLocks = async () => {
    if (!step1_Idea.trim()) {
      showAnimasiToast("❌ Masukkan Ide Cerita terlebih dahulu untuk dianalisis!");
      return;
    }

    setIsGeneratingLocks(true);
    showAnimasiToast("🤖 AI sedang merancang deskripsi konsisten...");

    const finalVisual = step3_Visual === 'Custom' ? (customVisual || 'Custom Style') : step3_Visual;

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

      const systemPrompt = `Anda adalah Scriptwriter dan Desainer Karakter Oval Animasi. Tugas Anda adalah membedah ide cerita dasar dan merancang deskripsi karakter serta latar belakang lingkungan yang sangat detail agar konsisten ketika diproses oleh generator gambar AI.

Ide Cerita: "${step1_Idea}"
Gaya Visual: "${finalVisual}"

Kembalikan jawaban HANYA berupa JSON murni dengan format berikut tanpa markdown:
{
  "character": "Deskripsi fisik karakter utama dalam bahasa Inggris (misal: 'A 10-year-old boy, short black hair, big brown eyes, wearing a red t-shirt and yellow backpack'). Tulis dengan detail yang konkret dan ringkas.",
  "environment": "Deskripsi latar belakang lingkungan spesifik dalam bahasa Inggris (misal: 'An old classic-style library, tall wooden bookshelves filled with books, warm sunlight streaming through a large dusty window')."
}`;

      const response = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Buat kunci konsistensi sekarang." }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const responseText = await response.text();
      let result = responseText ? JSON.parse(responseText) : {};

      if (result.candidates && result.candidates[0]) {
        let rawText = result.candidates[0].content.parts[0].text;
        try {
          const parsed = parseFlexibleJSON(rawText);
          if (parsed && parsed.character && parsed.environment) {
            setStep2_Character(parsed.character);
            setStep2_Environment(parsed.environment);
            showAnimasiToast("✨ Berhasil menyusun Kunci Konsistensi otomatis!");
          } else {
            throw new Error("Struktur JSON tidak lengkap.");
          }
        } catch (parseError) {
          throw new Error("Gagal mengurai respons AI.");
        }
      } else {
        throw new Error("Tidak ada respons dari AI.");
      }
    } catch (err) {
      console.error(err);
      showAnimasiToast("❌ Gagal merancang otomatis. Silakan isi manual.");
    } finally {
      setIsGeneratingLocks(false);
    }
  };

  const generatePipeline = async () => {
    if (!step1_Idea.trim()) {
      showAnimasiToast("❌ Silakan masukkan ide cerita terlebih dahulu!");
      return;
    }

    setIsGeneratingScript(true);
    setAnimasiError(null);
    setProjectData(null);
    setGeneratedImages({});
    setGeneratedAudio({});

    if (playingAudioId) {
      animasiAudioRefs.current[playingAudioId]?.pause();
      setPlayingAudioId(null);
    }

    const finalVisual = step3_Visual === 'Custom' ? (customVisual || 'Custom Style') : step3_Visual;
    const finalNarrative = step4_Narrative === 'Custom' ? (customNarrative || 'Custom Narrative') : step4_Narrative;

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

      const systemPrompt = `Anda adalah Sutradara & Produser Eksekutif dari Oval Animasi. Buatlah rancangan naskah, storyboard, dan instruksi visual teknis secara presisi dalam format JSON berdasarkan parameter berikut:

1. IDE CERITA DASAR: ${step1_Idea}
2. KARAKTER UTAMA (LOCK): ${step2_Character}
3. DETAIL LINGKUNGAN (LOCK): ${step2_Environment}
4. GAYA ESTETIKA VISUAL: ${finalVisual}
5. FORMAT NARASI: ${finalNarrative}
6. JUMLAH ADEGAN: ${step5_SceneCount}
7. ASPEK RASIO: ${step6_AspectRatio}
8. TIPE VOICE OVER (VO): ${step8_VOType}

ATURAN KONSISTENSI VISUAL DAN PROMPT GAMBAR (SANGAT KETAT):
- t2i_prompt (Text-to-Image): Wajib ditulis dalam Bahasa Inggris secara deskriptif, literal, dan jelas secara visual.
- Pola penulisan prompt HARUS mengikuti format terstruktur ini secara persis:
  "Subject: [Deskripsi detail fisik Karakter Utama secara persis sesuai '${step2_Character}']. Action: [Aksi fisik spesifik subjek pada adegan ini]. Environment: [Detail latar belakang lingkungan sesuai '${finalVisual}' and '${step2_Environment}']. Camera: [Sudut pandang kamera/close up/medium shot/wide shot]. Art Style: [Gaya visual '${finalVisual}']. Lighting: [Karakter pencahayaan/soft glow/sunlight/dramatic shadow]."

ATURAN KHUSUS UNTUK t2v_prompt (Text-to-Video) DAN TIPE VOICE OVER:
- Tambahkan instruksi gerakan kamera murni di awal (misal: "Slow camera pan left, zoom in slowly on the character...") lalu tempelkan teks prompt t2i_prompt tersebut.
- BERDASARKAN PARAMETER TIPE VOICE OVER ("${step8_VOType}"):
  * Jika Tipe VO adalah "Full Narator" atau "Campuran" (pada bagian narasi): Di dalam t2v_prompt, kata-kata narasi otomatis ditaruh sebagai suara latar belakang (VO) dan karakter utama TIDAK BOLEH menggerakkan mulut untuk berbicara ("mouth closed", "lips are still", "not speaking").
  * Jika Tipe VO adalah "Full Karakter" atau bagian dialog pada "Campuran": Karakter berbicara secara visual dengan gerakan mulut ("character is speaking naturally, realistic lip sync").

Kembalikan HANYA dokumen JSON murni tanpa ada pembuka, penutup, atau tanda markdown.
{
  "title": "Judul Film Animasi",
  "synopsis": "Ringkasan sinopsis pendek cerita",
  "scenes": [
    {
      "scene_number": 1,
      "narration": "Teks narasi suara yang akan dibacakan secara langsung",
      "action": "Aksi visual karakter",
      "t2i_prompt": "Prompt gambar berstruktur bahasa inggris yang sangat konsisten",
      "t2v_prompt": "Prompt video berstruktur bahasa inggris dasar dengan gerak kamera"
    }
  ]
}`;

      const response = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Mulailah merancang pipeline JSON." }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
          }
        })
      });

      const responseText = await response.text();
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        throw new Error("Respons dari server tidak berformat JSON valid. Silakan coba kembali.");
      }

      if (result.error) throw new Error(result.error.message);

      if (!result.candidates || result.candidates.length === 0) {
        throw new Error("Gagal memperoleh hasil generasi dari model AI.");
      }

      let rawText = result.candidates[0].content.parts[0].text;

      try {
        const parsedData = parseFlexibleJSON(rawText);

        if (parsedData && parsedData.scenes) {
          parsedData.scenes = parsedData.scenes.map((scene: any) => {
            let t2v = scene.t2v_prompt || "";
            let isDialog = false;

            if (step8_VOType === 'Full Karakter') {
              isDialog = true;
            } else if (step8_VOType === 'Campuran (Narator & Karakter)') {
              if (scene.narration && (scene.narration.includes('"') || scene.narration.includes("'"))) {
                isDialog = true;
              }
            }

            if (isDialog) {
              t2v = t2v.replace(/mouth closed/gi, '')
                       .replace(/not speaking/gi, '')
                       .replace(/silent/gi, '')
                       .replace(/lips? is still/gi, '')
                       .replace(/,\s*,/g, ',')
                       .trim();

              if (!t2v.toLowerCase().includes('speak') && !t2v.toLowerCase().includes('talk') && !t2v.toLowerCase().includes('lips')) {
                t2v += `, character is speaking and explicitly saying: "${scene.narration}", lips moving naturally, realistic lip sync`;
              } else if (!t2v.includes(scene.narration)) {
                t2v += `, explicitly saying: "${scene.narration}"`;
              }
            } else {
              t2v = t2v.replace(/character is speaking/gi, '')
                       .replace(/character is talking/gi, '')
                       .replace(/lips? moving/gi, '')
                       .replace(/lip sync(hronization)?/gi, '')
                       .replace(/explicitly saying:?.*?,/gi, '')
                       .replace(/explicitly saying:?.*$/gi, '')
                       .replace(/,\s*,/g, ',')
                       .trim();

              if (t2v.endsWith(',')) t2v = t2v.slice(0, -1);
              t2v += `, with background voiceover narration saying "${scene.narration}", the character's mouth remains closed and not speaking, lips are still`;
            }

            return { ...scene, t2v_prompt: t2v };
          });
        }

        setProjectData(parsedData);
        showAnimasiToast("✨ Pipeline storyboard dirancang! Memulai render gambar otomatis...");

        parsedData.scenes.forEach((scene: any) => {
          renderImage(scene.scene_number, scene.t2i_prompt);
        });
      } catch (parseError: any) {
        throw new Error("Sistem gagal menyaring data struktur JSON: " + parseError.message);
      }
    } catch (err: any) {
      console.error(err);
      setAnimasiError("Gagal menyusun naskah animasi: " + err.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const renderImageFallback = async (sceneNumber: number, prompt: string) => {
    try {
      const ratioInstruction =
        step6_AspectRatio === '9:16'
          ? 'vertical 9:16 portrait mobile aspect ratio'
          : step6_AspectRatio === '1:1'
          ? 'square 1:1 aspect ratio'
          : 'widescreen 16:9 landscape aspect ratio';
      const promptWithRatio = `Create an image in ${ratioInstruction}. Scene: ${prompt}`;

      const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'];
      for (const model of imageModels) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptWithRatio }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
            })
          });
          const responseText = await response.text();
          const result = JSON.parse(responseText);
          const base64 = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
          if (base64) {
            const rawBase64 = `data:image/png;base64,${base64}`;
            const croppedBase64 = await processImageRatio(rawBase64, step6_AspectRatio);
            setGeneratedImages((prev: any) => ({ ...prev, [sceneNumber]: croppedBase64 }));
            showAnimasiToast(`🎨 Gambar Adegan ${sceneNumber} dirender!`);
            return;
          }
        } catch (e) {}
      }
      throw new Error("Mesin render gambar tidak merespon.");
    } catch (err: any) {
      console.error(err);
      showAnimasiToast(`❌ Gagal render adegan ${sceneNumber}: ${err.message}`);
    }
  };

  const renderImage = async (sceneNumber: number, prompt: string) => {
    setGeneratingImages((prev: any) => ({ ...prev, [sceneNumber]: true }));
    try {
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ,.\-:]/g, "");
      const ratioInstruction =
        step6_AspectRatio === '9:16'
          ? 'vertical 9:16 portrait mobile aspect ratio'
          : step6_AspectRatio === '1:1'
          ? 'square 1:1 aspect ratio'
          : 'widescreen 16:9 landscape aspect ratio';
      const finalPrompt = `Create an image in ${ratioInstruction}. ${cleanPrompt}`.substring(0, 480);

      const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'];
      let rendered = false;
      let lastError = '';

      for (const model of imageModels) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: finalPrompt }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
            })
          });

          const responseText = await response.text();
          const result = responseText ? JSON.parse(responseText) : {};

          if (result.error) {
            lastError = result.error.message || `Gagal dengan model ${model}`;
            if (response.status === 429) {
              lastError = "Kuota gambar memerlukan Paid API Key di AI Studio.";
            }
            continue;
          }

          const base64 = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
          if (base64) {
            const rawBase64 = `data:image/png;base64,${base64}`;
            const croppedBase64 = await processImageRatio(rawBase64, step6_AspectRatio);
            setGeneratedImages((prev: any) => ({
              ...prev,
              [sceneNumber]: croppedBase64
            }));
            showAnimasiToast(`🎨 Gambar Adegan ${sceneNumber} selesai dirender!`);
            rendered = true;
            break;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }

      if (!rendered) {
        showAnimasiToast(`Gagal render: ${lastError || 'Pastikan kuota API Key mencukupi'}`);
      }
    } catch (e: any) {
      console.error("Render Error:", e);
      showAnimasiToast(`Gagal render: ${e.message || 'Koneksi terputus'}`);
    } finally {
      setGeneratingImages((prev: any) => ({ ...prev, [sceneNumber]: false }));
    }
  };

  const generateVoiceOver = async (sceneNumber: number, text: string) => {
    setGeneratingAudio((prev: any) => ({ ...prev, [sceneNumber]: true }));
    try {
      const voiceName = step7_VoiceGender === 'Laki-laki Berwibawa' ? 'Charon' : 'Kore';
      const strictTtsPrompt = `Read the following text aloud verbatim. Do not respond, do not edit, do not translate. Say this exact phrase: "${text}"`;

      const payload = {
        contents: [{ parts: [{ text: strictTtsPrompt }] }],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }
          }
        },
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName }
            }
          }
        }
      };

      let response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      let responseText = await response.text();
      let result = responseText ? JSON.parse(responseText) : {};

      if (result.error) {
        response = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        responseText = await response.text();
        result = responseText ? JSON.parse(responseText) : {};
      }

      const audioPart = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (audioPart && audioPart.data) {
        const wavUrl = decodeAudioData(audioPart.data);

        if (animasiAudioRefs.current[sceneNumber]) {
          animasiAudioRefs.current[sceneNumber].pause();
          delete animasiAudioRefs.current[sceneNumber];
        }

        setGeneratedAudio((prev: any) => ({ ...prev, [sceneNumber]: wavUrl }));
        showAnimasiToast(`🎙️ Audio Voice Over Adegan ${sceneNumber} berhasil dibuat!`);
      } else {
        throw new Error("Data audio tidak ditemukan dalam balasan AI.");
      }
    } catch (e: any) {
      console.error("Audio Generation Error:", e);
      showAnimasiToast(`❌ Gagal memproses suara: ${e.message}`);
    } finally {
      setGeneratingAudio((prev: any) => ({ ...prev, [sceneNumber]: false }));
    }
  };

  const togglePlayAudio = (sceneNumber: number) => {
    const audioUrl = generatedAudio[sceneNumber];
    if (!audioUrl) {
      showAnimasiToast("⚠️ Berkas audio belum siap! Silakan klik 'Isi Suara AI' terlebih dahulu.");
      return;
    }

    try {
      if (playingAudioId === sceneNumber) {
        if (animasiAudioRefs.current[sceneNumber]) {
          animasiAudioRefs.current[sceneNumber].pause();
        }
        setPlayingAudioId(null);
      } else {
        if (playingAudioId && animasiAudioRefs.current[playingAudioId]) {
          animasiAudioRefs.current[playingAudioId].pause();
        }

        if (!animasiAudioRefs.current[sceneNumber] || animasiAudioRefs.current[sceneNumber].src !== audioUrl) {
          if (animasiAudioRefs.current[sceneNumber]) {
            animasiAudioRefs.current[sceneNumber].pause();
          }
          animasiAudioRefs.current[sceneNumber] = new Audio(audioUrl);
          animasiAudioRefs.current[sceneNumber].onended = () => setPlayingAudioId(null);
          animasiAudioRefs.current[sceneNumber].onerror = (err: any) => {
            console.error("Audio playback error:", err);
            showAnimasiToast("❌ Gagal memutar file audio. Coba render ulang.");
            setPlayingAudioId(null);
          };
        } else {
          animasiAudioRefs.current[sceneNumber].currentTime = 0;
        }

        const playPromise = animasiAudioRefs.current[sceneNumber].play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingAudioId(sceneNumber);
            })
            .catch((error: any) => {
              console.error("Playback failed:", error);
              showAnimasiToast("❌ Browser memblokir pemutaran otomatis atau file rusak.");
              setPlayingAudioId(null);
            });
        }
      }
    } catch (err) {
      console.error("General play error:", err);
      showAnimasiToast("❌ Terjadi gangguan pada pemutar suara.");
    }
  };

  const downloadAudio = (sceneNumber: number) => {
    const audioUrl = generatedAudio[sceneNumber];
    if (!audioUrl) {
      showAnimasiToast("⚠️ Berkas audio belum tersedia!");
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `VO_Adegan_${sceneNumber}_OvalAnimasi.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showAnimasiToast(`📥 Mengunduh Audio Sulih Suara Adegan ${sceneNumber}...`);
    } catch (err) {
      showAnimasiToast("❌ Gagal mengunduh audio.");
    }
  };

  const handleCinemaSceneChange = (newIndex: number) => {
    if (playingAudioId) {
      animasiAudioRefs.current[playingAudioId]?.pause();
      setPlayingAudioId(null);
    }
    setCurrentCinemaScene(newIndex);
  };

  const handleEditPromptClick = (scene: any) => {
    setEditingImagePrompt(scene.scene_number);
    setTempImagePrompt(scene.t2i_prompt);
  };

  const handleSaveAndRenderPrompt = (scene_number: number) => {
    if (!tempImagePrompt.trim()) {
      showAnimasiToast("❌ Prompt tidak boleh kosong!");
      return;
    }

    const updatedScenes = projectData.scenes.map((s: any) =>
      s.scene_number === scene_number ? { ...s, t2i_prompt: tempImagePrompt } : s
    );
    setProjectData({ ...projectData, scenes: updatedScenes });

    renderImage(scene_number, tempImagePrompt);

    setEditingImagePrompt(null);
    showAnimasiToast("✏️ Prompt diperbarui dan sedang dirender ulang...");
  };

  useEffect(() => {
    return () => {
      Object.values(animasiAudioRefs.current).forEach((audio: any) => {
        audio?.pause();
      });
    };
  }, []);

  const copyAnimasiText = (text: string) => {
    const text_area = document.createElement("textarea");
    text_area.value = text;
    text_area.style.position = "fixed";
    text_area.style.top = "-9999px";
    text_area.style.left = "-9999px";
    text_area.style.opacity = "0";

    document.body.appendChild(text_area);
    text_area.focus();
    text_area.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showAnimasiToast('📋 Prompt berhasil disimpan ke clipboard!');
      } else {
        showAnimasiToast('❌ Gagal menyalin teks.');
      }
    } catch (err) {
      showAnimasiToast('❌ Gagal menyalin teks.');
    }
    document.body.removeChild(text_area);
  };

  const downloadAnimasiImage = (base64Url: string, name: string) => {
    const a = document.createElement('a');
    a.href = base64Url;
    a.download = `${name}_OvalAnimasi.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showAnimasiToast('💾 Menyimpan gambar kualitas tinggi...');
  };

  const resetAnimasiAll = () => {
    setProjectData(null);
    setGeneratedImages({});
    setGeneratedAudio({});
    setAnimasiError(null);
    if (playingAudioId) {
      animasiAudioRefs.current[playingAudioId]?.pause();
      setPlayingAudioId(null);
    }
  };

  const handleStartNew = () => {
    setStep1_Idea('');
    setStep2_Character('');
    setStep2_Environment('');
    setStep3_Visual('Pixar 3D Animation');
    setStep4_Narrative('Storytelling (Hero Journey)');
    setStep5_SceneCount(4);
    setStep6_AspectRatio('16:9');
    setStep7_VoiceGender('Laki-laki Berwibawa');
    setStep8_VOType('Full Narator');
    setCustomVisual('');
    setCustomNarrative('');
    resetAnimasiAll();
    showAnimasiToast("♻️ Semua parameter dan hasil studio telah diatur ulang ke awal!");
  };

  const getGridClass = () => {
    if (step6_AspectRatio === '9:16') {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5";
    } else if (step6_AspectRatio === '1:1') {
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6";
    } else {
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-slate-50/50 text-slate-800 font-sans flex flex-col lg:flex-row antialiased relative">
      {/* Toast Notification khusus Oval Animasi */}
      {animasiToastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl z-[300] text-sm font-medium animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          {animasiToastMessage}
        </div>
      )}

      {/* PANEL KIRI: PRESETS & CONFIGURATION */}
      <div className="w-full lg:w-[460px] xl:w-[500px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200/80 shadow-xl z-20 flex flex-col h-auto lg:h-[calc(100vh-4.5rem)] lg:sticky lg:top-[4.5rem] shrink-0">
        {/* Header Brand */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Film className="text-white animate-pulse" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                OVAL ANIMASI
              </h1>
              <p className="text-[10px] text-indigo-600 tracking-widest font-mono uppercase font-bold">
                AI Animation Director
              </p>
            </div>
          </div>
          {projectData && (
            <button
              onClick={resetAnimasiAll}
              className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all duration-200 border border-slate-200/50"
              title="Reset Hasil"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Configuration Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 animasi-scrollbar">
          {/* Step 1: Story Concept */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  1
                </span>
                Ide Utama Narasi
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Konseptual</span>
            </label>
            <textarea
              value={step1_Idea}
              onChange={(e) => setStep1_Idea(e.target.value)}
              className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none transition-colors duration-200 shadow-sm select-text"
              placeholder="Ceritakan core konsep atau ringkasan cerita yang akan digenerate..."
            />
          </div>

          {/* Step 2: Character & Environment locks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  2
                </span>
                Kunci Konsistensi Objek
              </span>
              <button
                type="button"
                onClick={generateConsistentLocks}
                disabled={isGeneratingLocks}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-md shadow-indigo-100"
              >
                {isGeneratingLocks ? (
                  <>
                    <Loader2 className="animate-spin" size={12} /> Merancang...
                  </>
                ) : (
                  <>
                    <Wand2 size={12} /> Auto-Generate
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-slate-400">
                <User size={15} />
                <span className="text-[9px] font-mono text-indigo-600 font-bold">KARAKTER UTAMA</span>
              </div>
              <textarea
                value={step2_Character}
                onChange={(e) => setStep2_Character(e.target.value)}
                className="w-full h-24 bg-white border border-slate-200 rounded-xl pl-3 pr-3 pt-8 pb-3 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none transition-colors duration-200 shadow-sm select-text"
                placeholder="Aktor utama (usia, baju, bentuk rambut, ekspresi kunci)..."
              />
            </div>

            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-slate-400">
                <Map size={15} />
                <span className="text-[9px] font-mono text-indigo-600 font-bold">DETAIL LINGKUNGAN</span>
              </div>
              <textarea
                value={step2_Environment}
                onChange={(e) => setStep2_Environment(e.target.value)}
                className="w-full h-24 bg-white border border-slate-200 rounded-xl pl-3 pr-3 pt-8 pb-3 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none transition-colors duration-200 shadow-sm select-text"
                placeholder="Deskripsi spesifik latar belakang adegan agar konsisten..."
              />
            </div>
          </div>

          {/* Step 3: Visual Art Style */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  3
                </span>
                Gaya Visual Estetika
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Art Style</span>
            </label>
            <div className="relative space-y-2">
              <div className="relative">
                <Paintbrush size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                <select
                  value={step3_Visual}
                  onChange={(e) => setStep3_Visual(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none appearance-none cursor-pointer shadow-sm"
                >
                  {ANIMATION_VISUAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {step3_Visual === 'Custom' && (
                <input
                  type="text"
                  value={customVisual}
                  onChange={(e) => setCustomVisual(e.target.value)}
                  placeholder="Ketik gaya visual kustom Anda di sini..."
                  className="w-full bg-white border border-indigo-400 rounded-xl px-4 py-3 text-xs text-indigo-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-colors duration-200 shadow-sm select-text"
                />
              )}
            </div>
          </div>

          {/* Step 4: Narrative Style */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  4
                </span>
                Skenario Narasi
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Narrative Style</span>
            </label>
            <div className="relative space-y-2">
              <div className="relative">
                <BookOpen size={15} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                <select
                  value={step4_Narrative}
                  onChange={(e) => setStep4_Narrative(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none appearance-none cursor-pointer shadow-sm"
                >
                  {ANIMATION_NARRATIVE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {step4_Narrative === 'Custom' && (
                <input
                  type="text"
                  value={customNarrative}
                  onChange={(e) => setCustomNarrative(e.target.value)}
                  placeholder="Ketik skenario narasi kustom Anda di sini..."
                  className="w-full bg-white border border-indigo-400 rounded-xl px-4 py-3 text-xs text-indigo-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-colors duration-200 shadow-sm select-text"
                />
              )}
            </div>
          </div>

          {/* Step 5: Scene Counts */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  5
                </span>
                Total Scene Animasi
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Scenes</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 12].map((num) => (
                <button
                  key={num}
                  onClick={() => setStep5_SceneCount(num)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all duration-250 ${
                    step5_SceneCount === num
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-100/50'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {num} Scenes
                </button>
              ))}
            </div>
          </div>

          {/* Step 6: Canvas Aspect Ratios */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  6
                </span>
                Aspek Rasio
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Ratio</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: 'Lansekap 16:9', icon: <Monitor size={16} /> },
                { id: '9:16', label: 'Vertikal 9:16', icon: <Smartphone size={16} /> },
                { id: '1:1', label: 'Kotak 1:1', icon: <Square size={16} /> }
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setStep6_AspectRatio(ratio.id)}
                  className={`py-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-250 ${
                    step6_AspectRatio === ratio.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-100/50'
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {ratio.icon}
                  <span className="text-[10px] font-bold">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 7: Narrator Voice Settings */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  7
                </span>
                Pilihan Suara Narator
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Voice</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Laki-laki Berwibawa', label: 'Laki-laki Berwibawa', icon: <Mic size={16} /> },
                { id: 'Perempuan', label: 'Perempuan', icon: <Mic size={16} /> }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStep7_VoiceGender(opt.id)}
                  className={`py-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-250 ${
                    step7_VoiceGender === opt.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-100/50'
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {opt.icon}
                  <span className="text-[10px] font-bold text-center leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 8: Voice Over Style / Type */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold">
                  8
                </span>
                Gaya Pengisi Suara (VO)
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">VO Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Full Narator', label: 'Full Narator', icon: <Volume2 size={14} /> },
                { id: 'Full Karakter', label: 'Full Karakter', icon: <User size={14} /> },
                { id: 'Campuran (Narator & Karakter)', label: 'Campuran', icon: <Layers size={14} /> }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStep8_VOType(opt.id)}
                  className={`py-3 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-250 ${
                    step8_VOType === opt.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-100/50'
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {opt.icon}
                  <span className="text-[9px] font-bold text-center leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mulai Baru (Reset Button) */}
          <div className="pt-6 border-t border-slate-100">
            <div className="bg-gradient-to-r from-orange-50/60 to-indigo-50/40 p-4 border border-dashed border-slate-200 rounded-2xl flex flex-col gap-3 items-center justify-center text-center">
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Ingin merancang ulang ide atau membuat skenario animasi baru?
              </p>
              <button
                type="button"
                onClick={handleStartNew}
                className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm hover:border-rose-200 active:scale-95"
              >
                <RefreshCw size={13} className="text-rose-500 animate-spin-slow" />
                Atur Ulang Studio (Mulai Baru)
              </button>
            </div>
          </div>
        </div>

        {/* Studio Build Trigger Button */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={generatePipeline}
            disabled={isGeneratingScript}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2.5 transition-all duration-300 ${
              isGeneratingScript
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/40'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-200 hover:shadow-indigo-300 hover:shadow-xl active:scale-95'
            }`}
          >
            {isGeneratingScript ? (
              <>
                <Loader2 className="animate-spin text-indigo-600" size={18} /> Meracik Naskah & Prompts...
              </>
            ) : (
              <>
                Mulai Studio Pipeline <Sparkles size={18} className="text-amber-400 fill-amber-400" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* PANEL KANAN: WORKSPACE OUTPUT */}
      <div className="flex-1 bg-slate-50/50 overflow-y-auto h-auto min-h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] animasi-scrollbar relative">
        {/* Loading Overlay */}
        {isGeneratingScript && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-35 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Meracik Skenario Cerita</h2>
            <p className="text-slate-500 mt-2 max-w-sm text-sm font-medium">
              AI sedang mengompilasi {step5_SceneCount} adegan agar berkesinambungan dan konsisten.
            </p>
          </div>
        )}

        {/* Error Notification Block */}
        {animasiError && (
          <div className="m-8 bg-rose-50 border border-rose-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-md">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-extrabold text-rose-800 text-lg mb-2">Terjadi Gangguan Studio</h3>
            <p className="text-rose-600 text-xs leading-relaxed mb-4">{animasiError}</p>
            <button
              onClick={generatePipeline}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State Showcase */}
        {!projectData && !isGeneratingScript && !animasiError && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[500px]">
            <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border border-slate-200/60 shadow-md">
              <Layers size={40} className="text-indigo-500/80" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kreativitas Menanti</h2>
            <p className="max-w-md text-slate-500 text-sm mt-2 font-medium">
              Sesuaikan parameter animasi di panel kiri, kemudian klik tombol "Mulai Studio Pipeline" untuk memulai proses produksi.
            </p>
          </div>
        )}

        {/* Storyboard Rendering Canvas Workspace */}
        {projectData && (
          <div className="p-6 sm:p-10 xl:p-12 max-w-[1400px] mx-auto animate-fadeIn pb-32">
            {/* Project Banner Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-200/80 pb-6">
              <div className="text-left space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-lg">
                  PROYEK TERKINI
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                  {projectData.title}
                </h2>
                <p className="text-sm text-slate-500 italic max-w-2xl font-medium">"{projectData.synopsis}"</p>

                {/* Active Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-white border border-slate-200/60 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    {step3_Visual === 'Custom' ? customVisual || 'Custom' : step3_Visual}
                  </span>
                  <span className="bg-white border border-slate-200/60 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    {step4_Narrative === 'Custom' ? customNarrative || 'Custom' : step4_Narrative}
                  </span>
                  <span className="bg-white border border-slate-200/60 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    {step5_SceneCount} Adegan
                  </span>
                  <span className="bg-white border border-slate-200/60 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    Layar {step6_AspectRatio}
                  </span>
                  <span className="bg-white border border-slate-200/60 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    {step8_VOType}
                  </span>
                </div>
              </div>

              {/* Theater Entrance Button */}
              <button
                onClick={() => {
                  handleCinemaSceneChange(0);
                  setIsCinemaMode(true);
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-200 shrink-0 text-sm active:scale-95"
              >
                <Tv size={18} /> Masuk Cinema Mode
              </button>
            </div>

            {/* ================= KELOMPOK 1: HASIL GENERATE GAMBAR (MANDIRI) ================= */}
            <div className="mb-10 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Kelompok Hasil Generate Gambar</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Koleksi frame visual storyboard hasil render AI beresolusi akurat
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Responsive Grid based on Aspect Ratio */}
              <div className={getGridClass()}>
                {projectData.scenes.map((scene: any) => (
                  <div
                    key={`img-${scene.scene_number}`}
                    className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-indigo-400/60 hover:bg-white hover:shadow-md"
                  >
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-lg">
                        Adegan {scene.scene_number}
                      </span>
                      {generatedImages[scene.scene_number] && (
                        <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          FHD READY
                        </span>
                      )}
                    </div>

                    {/* Image Aspect ratio container */}
                    <div
                      className={`
                        flex-1 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200/40 shadow-inner
                        ${
                          step6_AspectRatio === '9:16'
                            ? 'aspect-[9/16]'
                            : step6_AspectRatio === '1:1'
                            ? 'aspect-square'
                            : 'aspect-video'
                        }
                      `}
                    >
                      {editingImagePrompt === scene.scene_number ? (
                        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-3 flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                            <Pencil size={10} /> Revisi Prompt Gambar
                          </span>
                          <textarea
                            className="flex-1 w-full text-[10px] p-2 border border-indigo-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 animasi-scrollbar text-slate-700 bg-slate-50/50 transition-colors select-text"
                            value={tempImagePrompt}
                            onChange={(e) => setTempImagePrompt(e.target.value)}
                            placeholder="Tulis instruksi gambar di sini..."
                          />
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setEditingImagePrompt(null)}
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-bold transition-all border border-slate-200"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveAndRenderPrompt(scene.scene_number)}
                              className="flex-[2] py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold transition-all shadow-md shadow-indigo-200"
                            >
                              Simpan & Render
                            </button>
                          </div>
                        </div>
                      ) : generatingImages[scene.scene_number] ? (
                        <div className="flex flex-col items-center text-indigo-600 text-center p-3">
                          <Loader2 size={24} className="animate-spin mb-2 text-indigo-500" />
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/30">
                            Rendering...
                          </span>
                        </div>
                      ) : generatedImages[scene.scene_number] ? (
                        <>
                          <img
                            src={generatedImages[scene.scene_number]}
                            alt={`Adegan ${scene.scene_number}`}
                            className="w-full h-full object-cover animate-fadeIn"
                          />

                          {/* Hover Control Utilities */}
                          <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
                            <button
                              onClick={() =>
                                downloadAnimasiImage(generatedImages[scene.scene_number], `Scene_${scene.scene_number}`)
                              }
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl font-bold text-[10px] shadow-md flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Download size={12} /> Unduh Piksel {step6_AspectRatio}
                            </button>
                            <div className="flex gap-2 w-full">
                              <button
                                onClick={() => handleEditPromptClick(scene)}
                                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-2 rounded-xl font-bold text-[10px] shadow-sm flex items-center justify-center gap-1.5 transition-all border border-slate-200"
                              >
                                <Pencil size={10} /> Edit Prompt
                              </button>
                              <button
                                onClick={() => renderImage(scene.scene_number, scene.t2i_prompt)}
                                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-2 rounded-xl font-bold text-[10px] shadow-sm flex items-center justify-center gap-1.5 transition-all border border-slate-200"
                              >
                                <RefreshCw size={10} /> Render Ulang
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-slate-400 p-4">
                          <ImageIcon size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                          <p className="text-[8px] font-bold tracking-widest uppercase opacity-60">Belum Dirender</p>
                        </div>
                      )}
                    </div>

                    {/* Trigger Render Button */}
                    {!generatedImages[scene.scene_number] && editingImagePrompt !== scene.scene_number && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleEditPromptClick(scene)}
                          disabled={generatingImages[scene.scene_number]}
                          className="w-1/3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all duration-200 border border-slate-200 disabled:opacity-50"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => renderImage(scene.scene_number, scene.t2i_prompt)}
                          disabled={generatingImages[scene.scene_number]}
                          className="w-2/3 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all duration-200 border border-indigo-200/50 hover:border-indigo-600 disabled:opacity-50"
                        >
                          <ImageIcon size={12} /> Render Gambar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ================= KELOMPOK 2: ADEGAN SKENARIO (MANDIRI) ================= */}
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Kelompok Adegan Skenario</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Rencana naskah cerita, pengisian suara AI, serta salinan prompts untuk video generator
                  </p>
                </div>
              </div>

              {projectData.scenes.map((scene: any) => (
                <div
                  key={`sken-${scene.scene_number}`}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col gap-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-mono font-black w-8 h-8 flex items-center justify-center rounded-xl">
                        {scene.scene_number}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Adegan Skenario</h4>
                        <p className="text-[10px] text-slate-400 font-mono">ID: SEC-0{scene.scene_number}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/30">
                        {step8_VOType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Voiceover and script content card */}
                    <div className="bg-slate-50/50 border border-slate-200/40 rounded-2xl p-5 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
                          <Volume2 size={12} className="text-indigo-600" /> SULIH SUARA (VOICE OVER)
                        </span>

                        <div className="flex gap-1.5">
                          {generatedAudio[scene.scene_number] ? (
                            <>
                              <button
                                onClick={() => togglePlayAudio(scene.scene_number)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                                  playingAudioId === scene.scene_number
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white'
                                }`}
                              >
                                {playingAudioId === scene.scene_number ? (
                                  <>
                                    <Pause size={10} /> Mengudara
                                  </>
                                ) : (
                                  <>
                                    <Play size={10} /> Putar Audio
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => downloadAudio(scene.scene_number)}
                                className="p-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center"
                                title="Unduh WAV"
                              >
                                <Download size={11} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => generateVoiceOver(scene.scene_number, scene.narration)}
                              disabled={generatingAudio[scene.scene_number]}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-[10px] text-indigo-600 hover:text-white font-bold rounded-xl border border-indigo-100/50 hover:border-indigo-600 transition-all flex items-center gap-1"
                            >
                              {generatingAudio[scene.scene_number] ? (
                                <>
                                  <Loader2 size={10} className="animate-spin" /> Mengisi suara...
                                </>
                              ) : (
                                <>Isi Suara AI</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-700 text-xs italic leading-relaxed font-serif select-text">
                        "{scene.narration}"
                      </p>
                    </div>

                    {/* Technical T2I and T2V Prompts display blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Text-to-Image Prompt */}
                      <div className="relative group bg-slate-50/30 border border-slate-200/60 rounded-2xl p-4.5 hover:border-indigo-400/20 transition-all duration-200">
                        <button
                          onClick={() => copyAnimasiText(scene.t2i_prompt)}
                          className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-lg text-slate-400 transition-all shadow-sm z-10"
                          title="Salin Prompt"
                        >
                          <Copy size={11} />
                        </button>
                        <h5 className="text-[8px] font-mono font-bold text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <ImageIcon size={10} /> Midjourney V6 / Image Prompt
                        </h5>
                        <p className="text-[10px] text-slate-500 font-mono leading-relaxed pr-6 select-text break-words relative z-0">
                          {scene.t2i_prompt}
                        </p>
                      </div>

                      {/* Text-to-Video Prompt */}
                      <div className="relative group bg-slate-50/30 border border-slate-200/60 rounded-2xl p-4.5 hover:border-violet-400/20 transition-all duration-200">
                        <button
                          onClick={() => copyAnimasiText(scene.t2v_prompt)}
                          className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-violet-600 rounded-lg text-slate-400 transition-all shadow-sm z-10"
                          title="Salin Prompt"
                        >
                          <Copy size={11} />
                        </button>
                        <h5 className="text-[8px] font-mono font-bold text-violet-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Video size={10} /> Kling / Runway Video Prompt
                        </h5>
                        <p className="text-[10px] text-slate-500 font-mono leading-relaxed pr-6 select-text break-words relative z-0">
                          {scene.t2v_prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL EXCLUSIVE: CINEMA PREVIEWER MODE ================= */}
      {isCinemaMode && projectData && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col justify-between p-6 animate-fadeIn text-slate-800">
          {/* Cinema Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-lg">
                CINEMA THEATER
              </span>
              <h3 className="text-lg font-black text-slate-800">{projectData.title}</h3>
            </div>
            <button
              onClick={() => {
                setIsCinemaMode(false);
                if (playingAudioId) {
                  animasiAudioRefs.current[playingAudioId]?.pause();
                  setPlayingAudioId(null);
                }
              }}
              className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all border border-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Player Screen Layout */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 my-6 overflow-y-auto lg:overflow-visible">
            {/* Aspect Ratio Responsive Screen */}
            <div
              className={`
                bg-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden relative shadow-2xl shrink-0 transition-all duration-500
                ${
                  step6_AspectRatio === '9:16'
                    ? 'aspect-[9/16] h-[60vh] lg:h-[70vh]'
                    : step6_AspectRatio === '1:1'
                    ? 'aspect-square h-[50vh] lg:h-[60vh]'
                    : 'aspect-video w-full max-w-4xl lg:w-[60vw]'
                }
              `}
            >
              {generatedImages[projectData.scenes[currentCinemaScene]?.scene_number] ? (
                <img
                  src={generatedImages[projectData.scenes[currentCinemaScene]?.scene_number]}
                  alt="Cinema View"
                  className="w-full h-full object-cover animate-fadeIn"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50">
                  <ImageIcon size={48} className="mb-4 opacity-30" />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-50">Frame Belum Dirender</p>
                </div>
              )}

              {/* Cinema Overlay Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 pt-12 text-white">
                <p className="text-lg md:text-xl font-serif italic mb-4 leading-relaxed text-slate-100 drop-shadow-md">
                  "{projectData.scenes[currentCinemaScene]?.narration}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 uppercase">
                    Scene {projectData.scenes[currentCinemaScene]?.scene_number} of {projectData.scenes.length}
                  </span>

                  {generatedAudio[projectData.scenes[currentCinemaScene]?.scene_number] && (
                    <button
                      onClick={() => togglePlayAudio(projectData.scenes[currentCinemaScene]?.scene_number)}
                      className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${
                        playingAudioId === projectData.scenes[currentCinemaScene]?.scene_number
                          ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/10'
                      }`}
                    >
                      {playingAudioId === projectData.scenes[currentCinemaScene]?.scene_number ? (
                        <>
                          <Pause size={12} /> Jeda
                        </>
                      ) : (
                        <>
                          <Play size={12} /> Putar VO
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cinema Next/Prev Navigation Sidebar */}
            <div className="flex flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => handleCinemaSceneChange(Math.max(0, currentCinemaScene - 1))}
                disabled={currentCinemaScene === 0}
                className="p-4 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => handleCinemaSceneChange(Math.min(projectData.scenes.length - 1, currentCinemaScene + 1))}
                disabled={currentCinemaScene === projectData.scenes.length - 1}
                className="p-4 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-2xl shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-100"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
