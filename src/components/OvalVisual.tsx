import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Copy, 
  Download, 
  Eye, 
  Upload, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Maximize2, 
  Crop, 
  Video, 
  RefreshCw, 
  Check, 
  Megaphone, 
  Hash, 
  FileText, 
  Type, 
  UserPlus, 
  Wand2, 
  Loader2, 
  Pencil 
} from 'lucide-react';
import { 
  INITIAL_BG_LIST, 
  CAMERA_ANGLES, 
  VISUAL_STYLES, 
  ASPECT_RATIOS, 
  GENERATE_OPTIONS 
} from '../constants';
import { SimpleCropModal } from './SimpleCropModal';

interface OvalVisualProps {
  apiKey: string;
  showToast: (msg: string, isError?: boolean) => void;
  copyTextSafely: (text: string, successMsg?: string) => void;
}

export const OvalVisual: React.FC<OvalVisualProps> = ({ apiKey, showToast, copyTextSafely }) => {
  const [image, setImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [promptMode, setPromptMode] = useState<'manual' | 'auto'>('manual');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isPromptConfirmed, setIsPromptConfirmed] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generateCount, setGenerateCount] = useState(1);
  const [progress, setProgress] = useState(0);

  const [productImage, setProductImage] = useState<string | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  const [productImage2, setProductImage2] = useState<string | null>(null);
  const [productPreviewUrl2, setProductPreviewUrl2] = useState<string | null>(null);
  const [productImage3, setProductImage3] = useState<string | null>(null);
  const [productPreviewUrl3, setProductPreviewUrl3] = useState<string | null>(null);

  const [selectedBg, setSelectedBg] = useState('Studio Minimalis');
  const [customBgPrompt, setCustomBgPrompt] = useState('');
  const [selectedCameraAngle, setSelectedCameraAngle] = useState('Eye Level');
  const [selectedVisualStyle, setSelectedVisualStyle] = useState('UGC Natural');

  const [cropState, setCropState] = useState<{ isOpen: boolean; target: string | null; src: string | null }>({
    isOpen: false,
    target: null,
    src: null
  });
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [videoPromptsData, setVideoPromptsData] = useState<any[]>([]);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [socialContent, setSocialContent] = useState({ hook: '', caption: '', hashtags: '' });

  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetGender, setPresetGender] = useState('Wanita');
  const [presetAge, setPresetAge] = useState('Dewasa');
  const [presetHijab, setPresetHijab] = useState('Tidak');
  const [autoCharacter, setAutoCharacter] = useState<any>(null);

  const [editState, setEditState] = useState<{ isOpen: boolean; index: number | null; src: string | null; prompt: string }>({
    isOpen: false,
    index: null,
    src: null,
    prompt: ''
  });
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [bgList, setBgList] = useState(INITIAL_BG_LIST);
  const [isGeneratingBgs, setIsGeneratingBgs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const productInputRef2 = useRef<HTMLInputElement>(null);
  const productInputRef3 = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) handleImageFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const applyAutoPreset = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(256, 550, 200, Math.PI, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = presetGender === 'Wanita' ? '#cbd5e1' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, 2 * Math.PI);
    ctx.fill();
    if (presetGender === 'Wanita' && presetHijab === 'Ya') {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(256, 250, 130, Math.PI, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(126, 250);
      ctx.lineTo(60, 512);
      ctx.lineTo(452, 512);
      ctx.lineTo(386, 250);
      ctx.fill();
    }
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤖 AI PRESET', 256, 70);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Orang Indonesia | ${presetGender}`, 256, 120);
    ctx.fillText(`Usia ${presetAge} ${presetGender === 'Wanita' && presetHijab === 'Ya' ? '| Berhijab' : ''}`, 256, 160);
    const dataUrl = canvas.toDataURL('image/png');
    setImage(dataUrl.split(',')[1]);
    setPreviewUrl(dataUrl);
    setAutoCharacter({ gender: presetGender, age: presetAge, hijab: presetHijab });
    setPresetModalOpen(false);
  };

  const openCrop = (target: string, imageSrc: string) => setCropState({ isOpen: true, target, src: imageSrc });
  const closeCrop = () => setCropState({ isOpen: false, target: null, src: null });
  const applyCrop = (base64Image: string) => {
    const cleanedBase64 = base64Image.split(',')[1];
    if (cropState.target === 'model') {
      setImage(cleanedBase64);
      setPreviewUrl(base64Image);
    } else if (cropState.target === 'product') {
      setProductImage(cleanedBase64);
      setProductPreviewUrl(base64Image);
    } else if (cropState.target === 'product2') {
      setProductImage2(cleanedBase64);
      setProductPreviewUrl2(base64Image);
    } else if (cropState.target === 'product3') {
      setProductImage3(cleanedBase64);
      setProductPreviewUrl3(base64Image);
    }
    closeCrop();
  };

  const handleImageFile = (file: File) => {
    if (!file) return;
    setAutoCharacter(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage((reader.result as string).split(',')[1]);
      setPreviewUrl(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProductFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage((reader.result as string).split(',')[1]);
      setProductPreviewUrl(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProductFile2 = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage2((reader.result as string).split(',')[1]);
      setProductPreviewUrl2(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProductFile3 = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage3((reader.result as string).split(',')[1]);
      setProductPreviewUrl3(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (type === 'product') handleProductFile(file);
      else if (type === 'product2') handleProductFile2(file);
      else if (type === 'product3') handleProductFile3(file);
      else handleImageFile(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setAutoCharacter(null);
  };
  const clearProduct = () => {
    setProductImage(null);
    setProductPreviewUrl(null);
  };
  const clearProduct2 = () => {
    setProductImage2(null);
    setProductPreviewUrl2(null);
  };
  const clearProduct3 = () => {
    setProductImage3(null);
    setProductPreviewUrl3(null);
  };

  const generateAutoPrompt = async () => {
    if (!productImage) return;
    setIsGeneratingPrompt(true);
    try {
      const parts: any[] = [
        {
          text: "Kamu adalah pengarah gaya visual produk profesional. Analisa gambar produk ini dengan sangat detail (bentuk, warna, tekstur, material, dan jenis/vibe produk). Buatkan instruksi prompt (maksimal 3 kalimat) untuk AI Image Generator. Instruksikan bagaimana model utama harus memegang, memakai, atau berinteraksi dengan produk ini secara elegan dan natural, serta sebutkan spesifikasi fisik produknya secara eksplisit agar AI tidak salah menggambar. Gunakan bahasa Indonesia yang deskriptif. Langlang pada intinya tanpa kalimat sapaan/pembuka."
        }
      ];
      parts.push({ inlineData: { mimeType: "image/png", data: productImage } });
      if (productImage2) parts.push({ inlineData: { mimeType: "image/png", data: productImage2 } });
      if (productImage3) parts.push({ inlineData: { mimeType: "image/png", data: productImage3 } });

      const payload = { contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "text/plain" } };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        setPrompt(generatedText.trim());
        setIsPromptConfirmed(false);
      } else throw new Error(data.error?.message || "Gagal menganalisa produk.");
    } catch (err: any) {
      setPrompt(err.message || "Gagal menghasilkan prompt otomatis. Silakan periksa koneksi atau ketik secara manual.");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateDynamicBackgrounds = async () => {
    if (!prompt.trim()) return;
    setIsGeneratingBgs(true);
    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Kamu adalah fotografer dan penata seni profesional. Berdasarkan instruksi atau produk berikut: "${prompt}", berikan 6 ide latar belakang (background) yang sangat estetik, relevan, dan kreatif untuk pemotretan. Kembalikan HANYA dalam format JSON array (tanpa markdown, tanpa backtick): [{"name": "Nama Latar (Maks 3 Kata)", "desc": "Deskripsi visual (Maks 1 kalimat)"}]`
              }
            ]
          }
        ],
        generationConfig: { responseMimeType: "application/json" }
      };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const data = await response.json();
      let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '');
        const parsedBgs = JSON.parse(jsonText);
        parsedBgs.push({ name: 'Custom', desc: 'Ketik deskripsi latar belakang Anda sendiri.' });
        setBgList(parsedBgs);
        setSelectedBg(parsedBgs[0].name);
        showToast("Rekomendasi latar belakang berhasil diperbarui!");
      } else if (data.error) {
        showToast(`Gagal memuat latar: ${data.error.message}`, true);
      }
    } catch (error: any) {
      showToast(error.message || "Gagal memuat rekomendasi latar belakang.", true);
    } finally {
      setIsGeneratingBgs(false);
    }
  };

  const generateSingleVideoPrompt = async (index: number, baseContext: string, useVoice: boolean) => {
    setVideoPromptsData((prev) => {
      const newData = [...prev];
      if (!newData[index]) {
        newData[index] = { videoPrompt: '', voiceover: '', loading: true, useVoice, copied: false };
      } else {
        newData[index] = { ...newData[index], loading: true, useVoice };
      }
      return newData;
    });
    try {
      const bgDesc = selectedBg === 'Custom' ? customBgPrompt : bgList.find((bg) => bg.name === selectedBg)?.desc;
      let sceneContextStr = "";
      if (selectedVisualStyle === 'Storyboard') {
        const sceneNum = index + 1;
        const totalScenes = generateCount;
        let sceneDesc = "";
        let mood = "";
        if (sceneNum === 1) {
          sceneDesc = "Awal cerita. Karakter menghadapi masalah.";
          mood = "Kelelahan, penasaran.";
        } else if (sceneNum === totalScenes) {
          sceneDesc = "Akhir cerita / Hero Product Shot.";
          mood = "Premium, terpercaya.";
        } else if (sceneNum === Math.ceil(totalScenes / 2)) {
          sceneDesc = "Klimaks. Karakter aktif menggunakan produk.";
          mood = "Menyegarkan, memuaskan.";
        } else {
          sceneDesc = "Proses penemuan.";
          mood = "Tertarik.";
        }
        sceneContextStr = `\nIni Adegan ${sceneNum} dari ${totalScenes}.\nKonteks: ${sceneDesc}\nMood: ${mood}\n\nINSTRUKSI VOICEOVER STORYBOARD:\nVoiceover HARUS menceritakan kondisi adegan ini saja!`;
      }
      let voiceoverThemeStr = "";
      const totalVar = Math.max(generateCount, index + 1);
      const currentVar = index + 1;
      let focusTheme = "";
      if (totalVar === 1) focusTheme = "Menarik, persuasif.";
      else if (currentVar === 1) focusTheme = "Pengenalan (Hook).";
      else if (currentVar === totalVar) focusTheme = "Kesimpulan, Call to Action.";
      else focusTheme = "Menjelaskan detail keunggulan produk.";
      voiceoverThemeStr = `\n\nPANDUAN TEMA VOICEOVER:\nVariasi ke-${currentVar} dari ${totalVar}. Tema spesifik: "${focusTheme}".`;

      const aiPrompt = `Buatkan variasi prompt video ke-${index + 1} dari ide ini.\nIde: ${baseContext}\nLingkungan: ${bgDesc}\nSudut: ${selectedCameraAngle}\nGaya: ${selectedVisualStyle} ${sceneContextStr}\n${voiceoverThemeStr}\nATURAN PENTING:\n- Jika useVoice=true, "videoPrompt" (inggris) wajib lipsync, "voiceover" (indonesia) isi maksimal 20 kata.\n- Jika useVoice=false, "videoPrompt" tanpa bicara, "voiceover" kosong.\nKondisi saat ini: useVoice = ${useVoice}\nKembalikan HANYA JSON: {"videoPrompt": "...", "voiceover": "..."}`;
      const payload = { contents: [{ parts: [{ text: aiPrompt }] }], generationConfig: { responseMimeType: "application/json" } };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const data = await response.json();
      let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '');
      const parsed = JSON.parse(jsonText);
      setVideoPromptsData((prev) => {
        const newData = [...prev];
        newData[index] = {
          ...newData[index],
          videoPrompt: parsed.videoPrompt || "",
          voiceover: parsed.voiceover || "",
          loading: false
        };
        return newData;
      });
    } catch (error) {
      setVideoPromptsData((prev) => {
        const newData = [...prev];
        newData[index] = { ...newData[index], loading: false, videoPrompt: "Gagal memuat prompt." };
        return newData;
      });
    }
  };

  const handleToggleVoice = (index: number, checked: boolean) => generateSingleVideoPrompt(index, prompt, checked);
  const updateVideoPromptState = (index: number, field: string, value: any) =>
    setVideoPromptsData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });

  const generateSocialContent = async (baseContext = prompt) => {
    setIsGeneratingSocial(true);
    try {
      const bgDesc = selectedBg === 'Custom' ? customBgPrompt : bgList.find((bg) => bg.name === selectedBg)?.desc;
      const aiPrompt = `Buatkan Hook, Caption, dan Hashtag untuk konten produk gaya ${selectedVisualStyle}.\nKonteks: ${baseContext} di latar ${bgDesc}.\nKembalikan JSON: {"hook": "...", "caption": "...", "hashtags": "..."}`;
      const payload = { contents: [{ parts: [{ text: aiPrompt }] }], generationConfig: { responseMimeType: "application/json" } };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const data = await response.json();
      let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (jsonText) {
        jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '');
        setSocialContent(JSON.parse(jsonText));
      }
    } catch (error) {
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  const handleCopyVideoPrompt = (index: number) => {
    const data = videoPromptsData[index];
    let text = `VIDEO PROMPT:\n${data.videoPrompt}`;
    if (data.useVoice && data.voiceover) text += `\n\nVOICEOVER:\n${data.voiceover}`;
    copyTextSafely(text);
    setVideoPromptsData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], copied: true };
      return newData;
    });
    setTimeout(() => {
      setVideoPromptsData((prev) => {
        const newData = [...prev];
        if (newData[index]) newData[index] = { ...newData[index], copied: false };
        return newData;
      });
    }, 2000);
  };

  const downloadImageResult = (imgBase64: string, index: number) => {
    const link = document.createElement('a');
    link.href = imgBase64;
    link.download = `ovalstudio-${aspectRatio.replace(':', '-')}-${index + 1}.png`;
    link.click();
  };

  const openEditModal = (index: number, imageSrc: string) => {
    setEditState({ isOpen: true, index, src: imageSrc, prompt: '' });
    setEditError(null);
  };
  const closeEditModal = () => {
    if (!isEditingImage) setEditState({ isOpen: false, index: null, src: null, prompt: '' });
  };

  const processEditImage = async () => {
    if (!editState.prompt.trim() || !editState.src || editState.index === null) return;
    setIsEditingImage(true);
    setEditError(null);
    try {
      const parts = [
        {
          text: `Task: Edit, modify, or enhance the provided image strictly based on this instruction. \nInstruction: ${editState.prompt} \nCrucial: Maintain original aspect ratio and core elements.`
        },
        { inlineData: { mimeType: "image/png", data: editState.src.split(',')[1] } }
      ];
      const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'];
      let lastErrMsg = '';
      for (const model of imageModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } })
            }
          );
          const data = await response.json();
          if (data.error) {
            lastErrMsg = data.error.message || `Gagal dengan model ${model}`;
            if (response.status === 429) {
              lastErrMsg = "Kuota generasi gambar memerlukan API key berbayar (Paid API Key).";
            }
            continue;
          }
          const base64 = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
          if (base64) {
            const newImgData = `data:image/png;base64,${base64}`;
            setResults((prev) => {
              const newResults = [...prev];
              if (editState.index !== null) newResults[editState.index] = newImgData;
              return newResults;
            });
            generateSingleVideoPrompt(editState.index, prompt, videoPromptsData[editState.index]?.useVoice || false);
            closeEditModal();
            return;
          }
        } catch (err: any) {
          lastErrMsg = err.message || "Gagal memproses revisi.";
        }
      }
      throw new Error(lastErrMsg || "Model AI tidak dapat merevisi bagian tersebut.");
    } catch (err: any) {
      setEditError(err.message || "Gagal mengedit gambar. Silakan coba lagi.");
    } finally {
      setIsEditingImage(false);
    }
  };

  const generateSingleImage = async (enhancedPrompt: string) => {
    const parts: any[] = [{ text: enhancedPrompt }];
    parts.push({ inlineData: { mimeType: "image/png", data: image } });
    if (productImage) parts.push({ inlineData: { mimeType: "image/png", data: productImage } });
    if (productImage2) parts.push({ inlineData: { mimeType: "image/png", data: productImage2 } });
    if (productImage3) parts.push({ inlineData: { mimeType: "image/png", data: productImage3 } });
    
    const payload = { contents: [{ parts }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } };
    const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'];

    for (const model of imageModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        );
        const data = await response.json();
        if (data.error) {
          if (response.status === 429) {
            throw new Error("Kuota generasi gambar memerlukan API key berbayar (Paid API Key). Silakan atur di AI Studio.");
          }
          continue;
        }
        const base64 = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
        if (base64) return `data:image/png;base64,${base64}`;
      } catch (err: any) {
        if (err.message && err.message.includes("Paid API Key")) {
          throw err;
        }
      }
    }
    throw new Error("Model AI tidak mengembalikan gambar. Pastikan kuota API Key mencukupi untuk generasi gambar.");
  };

  const generateMultipleImages = async () => {
    if (!image || !productImage || !prompt) return;
    setLoading(true);
    setResults([]);
    setError(null);
    setProgress(0);
    const bgDesc = selectedBg === 'Custom' ? customBgPrompt : bgList.find((bg) => bg.name === selectedBg)?.desc;

    try {
      const generatedResults = [];
      for (let i = 0; i < generateCount; i++) {
        setProgress(i + 1);
        let currentPrompt = `Generate a new image based on the reference image(s). \n`;
        if (autoCharacter) {
          currentPrompt += `\n[CRITICAL CHARACTER OVERRIDE]: Must generate a live-action main character who is AUTHENTICALLY INDONESIAN based on: Gender: ${autoCharacter.gender}, Age: ${autoCharacter.age}, Hijab: ${autoCharacter.hijab === 'Ya' ? 'Yes' : 'No'}.\n\n`;
        }

        if (selectedVisualStyle === 'Storyboard') {
          const sceneNum = i + 1;
          const totalScenes = generateCount;
          let sceneDesc = "";
          let mood = "";
          if (sceneNum === 1) {
            sceneDesc = "The beginning. Problem or baseline state.";
            mood = "Fatigue, curious.";
          } else if (sceneNum === totalScenes) {
            sceneDesc = "The Hero Product Shot.";
            mood = "Premium, highly satisfied.";
          } else if (sceneNum === Math.ceil(totalScenes / 2)) {
            sceneDesc = "Interaction/Climax.";
            mood = "Refreshing, satisfying.";
          } else {
            sceneDesc = "Discovery.";
            mood = "Intrigued.";
          }
          currentPrompt += `Task: Create Scene ${sceneNum} of ${totalScenes}. Context: ${prompt}. Env: ${bgDesc}. Angle: ${selectedCameraAngle}. Mood: ${mood}. Style: Modern commercial storyboard. Aspect ratio must be ${aspectRatio}.`;
        } else {
          if (selectedVisualStyle === 'POV Hand Review') {
            currentPrompt += `Task: First-person POV holding product. No face visible.\n`;
          } else {
            currentPrompt += `Task: Blend main character with product naturally.\n`;
          }
          currentPrompt += `Context: ${prompt}. Env: ${bgDesc}. Angle: ${selectedCameraAngle}. Style: ${selectedVisualStyle}. Aspect ratio must be ${aspectRatio}.`;
        }
        const newImageBase64 = await generateSingleImage(currentPrompt);
        if (newImageBase64) {
          generatedResults.push(newImageBase64);
          setResults([...generatedResults]);
        }
      }
      setVideoPromptsData(
        Array.from({ length: generateCount }).map(() => ({
          videoPrompt: '',
          voiceover: '',
          loading: true,
          useVoice: false,
          copied: false
        }))
      );
      for (let j = 0; j < generateCount; j++) {
        await generateSingleVideoPrompt(j, prompt, false);
      }
      generateSocialContent(prompt);
    } catch (err: any) {
      setError(err.message || "Gagal menghasilkan gambar. Pastikan input sesuai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Produk & Model Generator</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Padukan karakter dan berbagai produk Anda secara presisi dengan kekuatan AI Visual.
          </p>
        </div>

        {/* Upload Area Utama */}
        <div className="grid md:grid-cols-2 gap-6 bg-slate-900/40 p-6 rounded-3xl border border-white/5 shadow-lg">
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-500 ml-2">
              1. Gambar Karakter/Model <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'model')}
              className={`relative group border-2 border-dashed rounded-3xl p-6 transition-all duration-500 text-center flex flex-col justify-center min-h-[250px] ${
                previewUrl ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-green-500/30 hover:bg-white/5'
              }`}
            >
              {previewUrl ? (
                <div className="relative inline-block group/preview mx-auto">
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-xl shadow-2xl border border-white/10 object-contain" />
                  <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCrop('model', previewUrl);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-full shadow-lg"
                    >
                      <Crop size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="mx-auto w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-green-500 group-hover:scale-110 transition-all">
                    <Upload size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-white">Upload Karakter</p>
                    <p className="text-xs text-slate-500">Klik, Drop, atau Paste</p>
                  </div>
                </div>
              )}
              {!previewUrl && (
                <div className="mt-4 pt-4 border-t border-white/10 w-full text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPresetModalOpen(true);
                    }}
                    className="text-xs bg-slate-800/80 hover:bg-green-500 hover:text-slate-950 text-slate-300 py-2.5 px-5 rounded-full shadow-lg inline-flex items-center gap-2 font-medium"
                  >
                    <UserPlus size={14} /> Tidak ada foto? Gunakan Preset AI
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e: any) => handleImageFile(e.target.files[0])} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase font-bold tracking-widest text-green-500 ml-2">
              2. Gambar Produk Utama <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'product')}
              className={`relative group border-2 border-dashed rounded-3xl p-6 transition-all duration-500 text-center flex flex-col justify-center min-h-[250px] ${
                productPreviewUrl ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-green-500/30 hover:bg-white/5'
              }`}
            >
              {productPreviewUrl ? (
                <div className="relative inline-block group/preview mx-auto">
                  <img src={productPreviewUrl} alt="Product Preview" className="max-h-48 rounded-xl shadow-2xl border border-white/10 object-contain" />
                  <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCrop('product', productPreviewUrl);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-full shadow-lg"
                    >
                      <Crop size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearProduct();
                      }}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4 cursor-pointer" onClick={() => productInputRef.current?.click()}>
                  <div className="mx-auto w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-green-500 group-hover:scale-110 transition-all">
                    <ImageIcon size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-white">Upload Produk</p>
                    <p className="text-xs text-slate-500">Baju, Tas, Aksesoris, dll</p>
                  </div>
                </div>
              )}
              <input type="file" ref={productInputRef} className="hidden" accept="image/*" onChange={(e: any) => handleProductFile(e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* Upload Area Tambahan (Produk 2 & 3) */}
        <div className="grid md:grid-cols-2 gap-6 bg-slate-900/20 p-6 rounded-3xl border border-white/5">
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-500 ml-2">
              Gambar Produk Tambahan 1{" "}
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-[9px] ml-2 font-medium border border-white/5">
                Opsional
              </span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'product2')}
              className={`relative group border-2 border-dashed rounded-3xl p-4 transition-all duration-500 text-center flex flex-col justify-center min-h-[160px] ${
                productPreviewUrl2 ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 hover:border-green-500/20 hover:bg-white/5'
              }`}
            >
              {productPreviewUrl2 ? (
                <div className="relative inline-block group/preview mx-auto">
                  <img src={productPreviewUrl2} alt="Product 2" className="max-h-32 rounded-xl shadow-xl border border-white/10 object-contain" />
                  <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCrop('product2', productPreviewUrl2);
                      }}
                      className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg"
                    >
                      <Crop size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearProduct2();
                      }}
                      className="p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-3 cursor-pointer" onClick={() => productInputRef2.current?.click()}>
                  <div className="mx-auto w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-green-500 transition-all">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-xs font-medium text-slate-400">Detail Spesifik (Bebas)</p>
                </div>
              )}
              <input type="file" ref={productInputRef2} className="hidden" accept="image/*" onChange={(e: any) => handleProductFile2(e.target.files[0])} />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-500 ml-2">
              Gambar Produk Tambahan 2{" "}
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-[9px] ml-2 font-medium border border-white/5">
                Opsional
              </span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'product3')}
              className={`relative group border-2 border-dashed rounded-3xl p-4 transition-all duration-500 text-center flex flex-col justify-center min-h-[160px] ${
                productPreviewUrl3 ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 hover:border-green-500/20 hover:bg-white/5'
              }`}
            >
              {productPreviewUrl3 ? (
                <div className="relative inline-block group/preview mx-auto">
                  <img src={productPreviewUrl3} alt="Product 3" className="max-h-32 rounded-xl shadow-xl border border-white/10 object-contain" />
                  <div className="absolute -top-3 -right-3 flex gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCrop('product3', productPreviewUrl3);
                      }}
                      className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg"
                    >
                      <Crop size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearProduct3();
                      }}
                      className="p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-3 cursor-pointer" onClick={() => productInputRef3.current?.click()}>
                  <div className="mx-auto w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-green-500 transition-all">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-xs font-medium text-slate-400">Detail Spesifik (Bebas)</p>
                </div>
              )}
              <input type="file" ref={productInputRef3} className="hidden" accept="image/*" onChange={(e: any) => handleProductFile3(e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-4 bg-slate-900/40 p-6 rounded-3xl border border-white/5 relative z-30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 ml-2">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-500">
              3. Instruksi prompt dan Spesifikasi Produk <span className="text-red-500">*</span>
            </label>
            <div className="flex bg-slate-950 rounded-xl p-1 border border-white/10 w-fit shadow-inner">
              <button
                onClick={() => {
                  setPromptMode('manual');
                  setIsPromptConfirmed(true);
                }}
                className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  promptMode === 'manual' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                MANUAL
              </button>
              <button
                onClick={() => {
                  setPromptMode('auto');
                  setIsPromptConfirmed(false);
                }}
                className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  promptMode === 'auto' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Wand2 size={12} /> OTOMATIS AI
              </button>
            </div>
          </div>

          {promptMode === 'auto' && !isPromptConfirmed && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-purple-400 shrink-0 mt-0.5" />
                <p className="text-sm text-purple-300 font-medium leading-relaxed">
                  AI akan menganalisa seluruh gambar produk yang Anda unggah secara cerdas, lalu meracik instruksi prompt yang estetik dan sangat presisi.
                </p>
              </div>
              <button
                onClick={generateAutoPrompt}
                disabled={isGeneratingPrompt || !productImage}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isGeneratingPrompt || !productImage
                    ? 'bg-purple-500/20 text-white/50 cursor-not-allowed border border-purple-500/30'
                    : 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.01]'
                }`}
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Menganalisa Produk & Meracik Prompt...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Mulai Analisa Produk
                  </>
                )}
              </button>
              {!productImage && (
                <p className="text-[11px] text-red-400 text-center font-medium">
                  *Mohon unggah Gambar Produk Utama (Langkah 2) terlebih dahulu.
                </p>
              )}
            </div>
          )}

          {(promptMode === 'manual' || prompt) && (
            <div className="space-y-3 relative animate-in fade-in duration-500">
              <textarea
                placeholder="Contoh: Buat model melihat ke arah kamera dengan senyum tipis, tangan kanannya memegang botol parfum. Produk parfum harus terlihat jelas dan elegan..."
                className={`w-full bg-slate-950 border ${
                  promptMode === 'auto' && isPromptConfirmed
                    ? 'border-green-500/50 ring-1 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                    : 'border-white/10'
                } rounded-2xl p-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors resize-y min-h-[120px] select-text`}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (promptMode === 'auto') setIsPromptConfirmed(false);
                }}
                disabled={isGeneratingPrompt}
              />

              {promptMode === 'auto' && prompt && !isPromptConfirmed && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setIsPromptConfirmed(true)}
                    className="px-6 py-3 bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle2 size={18} /> Konfirmasi & Lanjutkan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wrapper Options & Generate Button */}
        <div
          className={`space-y-12 transition-all duration-700 ${
            !isPromptConfirmed && promptMode === 'auto' ? 'opacity-30 pointer-events-none grayscale blur-[1px]' : ''
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8 bg-slate-900/40 p-6 rounded-3xl border border-white/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-green-500" />
                  <label className="text-xs uppercase font-bold tracking-widest text-slate-500">4. Pilih Latar Belakang</label>
                </div>
                <button
                  onClick={generateDynamicBackgrounds}
                  disabled={isGeneratingBgs || !prompt}
                  className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={12} className={isGeneratingBgs ? "animate-spin" : ""} /> AI SUGGEST
                </button>
              </div>
              <div className="h-[280px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {isGeneratingBgs ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-50">
                    <Loader2 size={24} className="animate-spin text-green-500" />
                    <span className="text-xs text-slate-400 font-medium">Meracik ide latar AI...</span>
                  </div>
                ) : (
                  bgList.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => setSelectedBg(bg.name)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 ${
                        selectedBg === bg.name
                          ? 'bg-green-500/10 border-green-500 text-green-400'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-medium text-sm">{bg.name}</div>
                      <div className="text-[10px] opacity-60 mt-1 line-clamp-1">{bg.desc}</div>
                    </button>
                  ))
                )}
              </div>
              {selectedBg === 'Custom' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    placeholder="Contoh: Di dalam pesawat ruang angkasa..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-green-500/50"
                    value={customBgPrompt}
                    onChange={(e) => setCustomBgPrompt(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-2">
                <Camera size={14} className="text-blue-500" />
                <label className="text-xs uppercase font-bold tracking-widest text-slate-500">5. Camera Angle</label>
              </div>
              <div className="h-[280px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {CAMERA_ANGLES.map((angle) => (
                  <button
                    key={angle.name}
                    onClick={() => setSelectedCameraAngle(angle.name)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 ${
                      selectedCameraAngle === angle.name
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{angle.name}</div>
                    <div className="text-[10px] opacity-60 mt-1">{angle.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-2">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-purple-500" />
                  <label className="text-xs uppercase font-bold tracking-widest text-slate-500">6. Gaya Visual</label>
                </div>
                {selectedVisualStyle === 'Storyboard' && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md font-bold animate-pulse">
                    MODE KHUSUS IKLAN
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {VISUAL_STYLES.map((style) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedVisualStyle(style.name)}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      selectedVisualStyle === style.name
                        ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-md scale-[1.02]'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-xs">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-2">
                <Maximize2 size={14} className="text-green-500" />
                <label className="text-xs uppercase font-bold tracking-widest text-slate-500">7. Rasio Aspek</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                      aspectRatio === ratio.value
                        ? 'bg-green-500/10 border-green-500 text-green-500'
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-bold">{ratio.label}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-60">{ratio.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-2">
                <Copy size={14} className="text-green-500" />
                <label className="text-xs uppercase font-bold tracking-widest text-slate-500">8. Jumlah Generate</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GENERATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGenerateCount(opt.value)}
                    className={`flex items-center justify-center py-3 rounded-xl border transition-all duration-300 ${
                      generateCount === opt.value
                        ? 'bg-green-500/10 border-green-500 text-green-500 font-bold'
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-200 text-sm'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={
              loading ||
              !image ||
              !productImage ||
              !prompt ||
              (promptMode === 'auto' && !isPromptConfirmed)
            }
            onClick={generateMultipleImages}
            className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 tracking-wide ${
              loading ||
              !image ||
              !productImage ||
              !prompt ||
              (promptMode === 'auto' && !isPromptConfirmed)
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-green-500 text-slate-950 hover:bg-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>
                    Generating {progress} / {generateCount}...
                  </span>
                </div>
                <span className="text-xs font-medium opacity-70">Harap tunggu, model memproses satu per satu.</span>
              </div>
            ) : (
              <>
                <Sparkles size={24} />
                <span>GENERATE VISUAL</span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Area Grid Hasil OVAL VISUAL */}
          {(results.length > 0 || loading) && (
            <div className="animate-in fade-in duration-700 space-y-6 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between ml-2">
                <span className="text-sm uppercase font-bold tracking-widest text-green-500 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Output Generator
                </span>
                <span className="text-xs text-slate-500 font-medium bg-slate-900 px-3 py-1 rounded-full">
                  {results.length} dari {generateCount} selesai
                </span>
              </div>
              <div
                className={`grid gap-6 ${
                  generateCount > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'
                }`}
              >
                {results.map((res, idx) => (
                  <div key={idx} className="bg-slate-900 border border-white/10 rounded-3xl p-4 overflow-hidden group relative">
                    <div className="flex justify-center w-full">
                      <img
                        src={res}
                        alt={`Result ${idx + 1}`}
                        className={`w-full rounded-2xl shadow-2xl transition-all duration-500 ${
                          aspectRatio === '9:16'
                            ? 'aspect-[9/16]'
                            : aspectRatio === '16:9'
                            ? 'aspect-[16/9]'
                            : 'aspect-square'
                        } object-cover cursor-zoom-in`}
                        onClick={() => setFullScreenImage(res)}
                      />
                    </div>
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex-wrap justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(idx, res);
                        }}
                        className="p-2 sm:p-3 bg-slate-900/80 backdrop-blur-md rounded-xl text-white hover:text-blue-500 hover:bg-slate-800 transition-colors shadow-xl border border-white/10"
                        title="Edit/Revisi Gambar"
                      >
                        <Pencil size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullScreenImage(res);
                        }}
                        className="p-2 sm:p-3 bg-slate-900/80 backdrop-blur-md rounded-xl text-white hover:text-green-500 hover:bg-slate-800 transition-colors shadow-xl border border-white/10"
                        title="Preview Full"
                      >
                        <Eye size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImageResult(res, idx);
                        }}
                        className="p-2 sm:p-3 bg-green-500 text-slate-950 rounded-xl hover:bg-green-400 transition-colors shadow-xl"
                        title="Download"
                      >
                        <Download size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-6 left-6 pointer-events-none">
                      <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-xl border border-white/10">
                        Var {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
                {loading &&
                  Array.from({ length: generateCount - results.length }).map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="bg-slate-900 border border-white/5 rounded-3xl p-4 overflow-hidden flex flex-col justify-center items-center h-full min-h-[300px]"
                    >
                      <div className="w-10 h-10 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin mb-4" />
                      <p className="text-slate-500 text-sm animate-pulse">Merender gambar...</p>
                    </div>
                  ))}
              </div>

              {/* AI Video Prompt & Social Media */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 gap-8 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Video size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Video Prompt Generator</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Prompt video disesuaikan otomatis untuk masing-masing variasi hasil gambar di atas.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {videoPromptsData.map((vp, index) => (
                        <div key={index} className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col space-y-4 shadow-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                                Variasi {index + 1}
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <div
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                    vp.useVoice ? 'bg-blue-500 border-blue-500' : 'border-slate-600 group-hover:border-blue-400'
                                  }`}
                                >
                                  {vp.useVoice && <Check size={12} className="text-white" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={vp.useVoice || false}
                                  onChange={(e) => handleToggleVoice(index, e.target.checked)}
                                />
                                <span className="text-sm font-medium text-slate-300">Sisipkan Voiceover</span>
                              </label>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => generateSingleVideoPrompt(index, prompt, vp.useVoice)}
                                className="flex-1 sm:flex-none justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium"
                                title="Render Ulang"
                              >
                                <RefreshCw size={14} className={vp.loading ? "animate-spin text-blue-400" : ""} /> Render Ulang
                              </button>
                              <button
                                onClick={() => handleCopyVideoPrompt(index)}
                                className="flex-1 sm:flex-none justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium"
                              >
                                {vp.copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                {vp.copied ? 'Tersalin!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6 relative">
                            {vp.loading && (
                              <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-white/5">
                                <div className="flex flex-col items-center gap-2">
                                  <RefreshCw size={24} className="text-blue-500 animate-spin" />
                                  <span className="text-xs text-blue-400 animate-pulse font-medium">
                                    Meracik prompt variasi {index + 1}...
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <Video size={12} className="text-blue-500" /> 1. Text-to-Video Prompt
                              </label>
                              <textarea
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-[180px] leading-relaxed custom-scrollbar transition-colors select-text"
                                value={vp.videoPrompt || ''}
                                onChange={(e) => updateVideoPromptState(index, 'videoPrompt', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 transition-opacity duration-300">
                              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <Type size={12} className={vp.useVoice ? "text-blue-500" : "text-slate-600"} /> 2. Voiceover (Maks. 8 Detik)
                              </label>
                              <textarea
                                className={`w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-[180px] leading-relaxed custom-scrollbar transition-colors select-text ${
                                  !vp.useVoice ? 'opacity-60 bg-slate-950/50' : ''
                                }`}
                                value={vp.voiceover || ''}
                                onChange={(e) => updateVideoPromptState(index, 'voiceover', e.target.value)}
                                placeholder={vp.useVoice ? "Naskah voiceover..." : "Ketik naskah (centang 'Sisipkan Voiceover' untuk mengaktifkan)..."}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Megaphone size={16} className="text-purple-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Social Media Kit</h3>
                      </div>
                      <button
                        onClick={() => copyTextSafely(`HOOK:\n${socialContent.hook}\n\nCAPTION:\n${socialContent.caption}\n\n${socialContent.hashtags}`)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium w-full sm:w-auto justify-center"
                      >
                        <Copy size={14} /> Copy Semua
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Copywriting instan untuk diposting bersama hasil foto/video Anda.
                    </p>
                    <div className="space-y-5 flex-1 relative min-h-[300px]">
                      {isGeneratingSocial && (
                        <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-white/5">
                          <div className="flex flex-col items-center gap-2">
                            <RefreshCw size={24} className="text-purple-500 animate-spin" />
                            <span className="text-xs text-purple-400 animate-pulse font-medium">Membuat copywriting...</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <FileText size={12} className="text-purple-500" /> Hook (Pancingan)
                        </label>
                        <textarea
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none min-h-[70px] leading-relaxed transition-colors select-text"
                          value={socialContent.hook}
                          onChange={(e) => setSocialContent({ ...socialContent, hook: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <Type size={12} className="text-purple-500" /> Caption Utama
                        </label>
                        <textarea
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y min-h-[140px] leading-relaxed transition-colors select-text"
                          value={socialContent.caption}
                          onChange={(e) => setSocialContent({ ...socialContent, caption: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                          <Hash size={12} className="text-purple-500" /> Hashtags
                        </label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium tracking-wide transition-colors select-text"
                          value={socialContent.hashtags}
                          onChange={(e) => setSocialContent({ ...socialContent, hashtags: e.target.value })}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => generateSocialContent(prompt)}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-4"
                    >
                      <RefreshCw size={16} /> Render Ulang Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Crop Image */}
      {cropState.isOpen && cropState.src && (
        <SimpleCropModal
          isOpen={cropState.isOpen}
          imageSrc={cropState.src}
          onClose={closeCrop}
          onApply={applyCrop}
        />
      )}

      {/* MODAL: View Full Screen */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[300] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white bg-slate-800 hover:bg-slate-700 p-3 rounded-full transition-colors shadow-xl"
            onClick={() => setFullScreenImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={fullScreenImage}
            alt="Full Screen"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* MODAL: Edit Image AI */}
      {editState.isOpen && editState.src && (
        <div className="fixed inset-0 z-[300] bg-slate-950/95 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Pencil className="text-blue-500" /> Revisi Detail Gambar AI
              </h3>
              <button
                onClick={closeEditModal}
                disabled={isEditingImage}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="md:w-1/2 p-6 flex flex-col justify-center items-center bg-slate-950/50 relative">
                <img src={editState.src} alt="To Edit" className="max-w-full max-h-full object-contain rounded-xl border border-white/5" />
                {isEditingImage && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl border border-blue-500/30 m-6">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-400 font-bold animate-pulse text-sm">AI sedang merevisi gambar...</p>
                  </div>
                )}
              </div>

              <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-white/10 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instruksi Revisi AI</label>
                  <p className="text-xs text-slate-500 mb-2">
                    Tulis instruksi spesifik dalam Bahasa Inggris. Contoh:{" "}
                    <span className="italic text-slate-400">
                      "make the shirt color red", "change background to a beach", "add sunglasses"
                    </span>
                  </p>
                  <textarea
                    value={editState.prompt}
                    onChange={(e) => setEditState({ ...editState, prompt: e.target.value })}
                    placeholder="Contoh: Change the shirt color to neon blue..."
                    className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors"
                    disabled={isEditingImage}
                  />
                </div>

                {editError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" /> {editError}
                  </div>
                )}

                <div className="mt-auto pt-4 flex gap-3">
                  <button
                    onClick={closeEditModal}
                    disabled={isEditingImage}
                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 border border-white/5"
                  >
                    Batal
                  </button>
                  <button
                    onClick={processEditImage}
                    disabled={isEditingImage || !editState.prompt.trim()}
                    className="flex-[2] py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditingImage ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" /> Memproses...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Eksekusi AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI Preset Karakter */}
      {presetModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Wand2 className="text-green-500" /> AI Preset Karakter
              </h3>
              <button onClick={() => setPresetModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Gender Karakter</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPresetGender('Wanita')}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      presetGender === 'Wanita'
                        ? 'bg-green-500/10 border-green-500 text-green-400'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Wanita
                  </button>
                  <button
                    onClick={() => setPresetGender('Pria')}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      presetGender === 'Pria'
                        ? 'bg-green-500/10 border-green-500 text-green-400'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Pria
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Rentang Usia</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Remaja', 'Dewasa', 'Tua'].map((age) => (
                    <button
                      key={age}
                      onClick={() => setPresetAge(age)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        presetAge === age
                          ? 'bg-green-500/10 border-green-500 text-green-400'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {presetGender === 'Wanita' && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-slate-500 uppercase">Gunakan Hijab?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPresetHijab('Ya')}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        presetHijab === 'Ya'
                          ? 'bg-green-500/10 border-green-500 text-green-400'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Ya, Berhijab
                    </button>
                    <button
                      onClick={() => setPresetHijab('Tidak')}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        presetHijab === 'Tidak'
                          ? 'bg-green-500/10 border-green-500 text-green-400'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={applyAutoPreset}
                className="w-full mt-4 bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> Terapkan Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
