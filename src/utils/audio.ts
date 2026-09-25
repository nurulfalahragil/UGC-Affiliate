// Audio utilities and helper functions

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function pcmToWav(pcmData: ArrayBuffer, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.byteLength, true);

  return new Blob([view, pcmData], { type: 'audio/wav' });
}

export const buildWavHeaderFromPcm = (pcmBytes: Uint8Array, sampleRate = 24000): ArrayBuffer => {
  const len = pcmBytes.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  view.setUint32(0, 0x46464952, true); // "RIFF"
  view.setUint32(4, 36 + len, true);
  view.setUint32(8, 0x45564157, true); // "WAVE"
  view.setUint32(12, 0x20746d66, true); // "fmt "
  view.setUint32(16, 16, true); // Format chunk length
  view.setUint16(20, 1, true); // Format raw PCM
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true); // 24kHz
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  view.setUint32(36, 0x61746164, true); // "data"
  view.setUint32(40, len, true); // Data chunk size

  const u8view = new Uint8Array(buffer, 44);
  u8view.set(pcmBytes);

  return buffer;
};

export const decodeAudioData = (base64Data: string): string => {
  try {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const isWav = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isMp3 = (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);

    let mimeType = 'audio/wav';
    let finalBuffer: ArrayBuffer | Uint8Array = bytes;

    if (isWav) {
      mimeType = 'audio/wav';
    } else if (isMp3) {
      mimeType = 'audio/mp3';
    } else {
      finalBuffer = buildWavHeaderFromPcm(bytes, 24000);
      mimeType = 'audio/wav';
    }

    const blob = new Blob([finalBuffer as BlobPart], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Audio decoding error:", e);
    throw new Error("Gagal mengolah berkas audio.");
  }
};

export const parseFlexibleJSON = (text: string): any => {
  let cleanText = text.replace(/`{3}(?:json)?/gi, '').replace(/`{3}/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch (err) {
    const startIndex = cleanText.indexOf('{');
    let endIndex = cleanText.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      let substring = cleanText.substring(startIndex, endIndex + 1);
      let isValid = false;
      let parsedData = null;
      while (substring.length > 5 && !isValid) {
        try {
          parsedData = JSON.parse(substring);
          isValid = true;
        } catch (e) {
          endIndex = substring.lastIndexOf('}', substring.length - 2);
          if (endIndex === -1) break;
          substring = substring.substring(0, endIndex + 1);
        }
      }
      if (isValid) return parsedData;
    }
    throw err;
  }
};

export const fetchWithRetry = async (url: string, options: any, maxRetries = 5): Promise<Response> => {
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Terjadi kegagalan koneksi berulang kali. Silakan coba sesaat lagi.");
};
