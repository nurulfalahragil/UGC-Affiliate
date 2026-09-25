import React, { useRef, useState, useEffect } from 'react';
import { Crop, X, Check } from 'lucide-react';

interface SimpleCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApply: (croppedBase64: string) => void;
}

export const SimpleCropModal: React.FC<SimpleCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApply,
}) => {
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [action, setAction] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
      setAction(null);
    }
  }, [isOpen, imageSrc]);

  const handlePointerDown = (e: React.PointerEvent, type: string) => {
    e.stopPropagation();
    e.preventDefault();
    setAction(type);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartCrop({ ...crop });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!action || !startCrop || !imgContainerRef.current) return;
    e.preventDefault();
    const rect = imgContainerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startPos.x) / rect.width) * 100;
    const dy = ((e.clientY - startPos.y) / rect.height) * 100;
    let newCrop = { ...startCrop };
    if (action === 'move') {
      newCrop.x = Math.max(0, Math.min(100 - newCrop.width, startCrop.x + dx));
      newCrop.y = Math.max(0, Math.min(100 - newCrop.height, startCrop.y + dy));
    } else {
      if (action.includes('n')) {
        const newY = Math.max(0, Math.min(startCrop.y + startCrop.height - 5, startCrop.y + dy));
        newCrop.y = newY;
        newCrop.height = startCrop.y + startCrop.height - newY;
      }
      if (action.includes('s')) {
        newCrop.height = Math.max(5, Math.min(100 - startCrop.y, startCrop.height + dy));
      }
      if (action.includes('w')) {
        const newX = Math.max(0, Math.min(startCrop.x + startCrop.width - 5, startCrop.x + dx));
        newCrop.x = newX;
        newCrop.width = startCrop.x + startCrop.width - newX;
      }
      if (action.includes('e')) {
        newCrop.width = Math.max(5, Math.min(100 - startCrop.x, startCrop.width + dx));
      }
    }
    setCrop(newCrop);
  };

  const handlePointerUp = () => setAction(null);

  const handleApply = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pixelW = (crop.width / 100) * img.width;
      const pixelH = (crop.height / 100) * img.height;
      canvas.width = pixelW;
      canvas.height = pixelH;
      ctx.drawImage(
        img,
        (crop.x / 100) * img.width,
        (crop.y / 100) * img.height,
        pixelW,
        pixelH,
        0,
        0,
        pixelW,
        pixelH
      );
      onApply(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col backdrop-blur-md select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="p-4 flex justify-between items-center bg-slate-900 border-b border-white/10 shadow-lg z-20">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Crop size={20} className="text-green-500" /> Area Potong (Crop)
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex items-center justify-center p-6 relative">
        <div className="relative inline-block max-w-full max-h-full" ref={imgContainerRef}>
          <img
            src={imageSrc}
            alt="source"
            className="max-w-full max-h-full object-contain pointer-events-none"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
          <div
            className="absolute border-2 border-green-500 cursor-move shadow-[0_0_25px_rgba(34,197,94,0.3)]"
            style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%` }}
            onPointerDown={(e) => handlePointerDown(e, 'move')}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={imageSrc}
                alt="cropped"
                className="absolute max-w-none pointer-events-none"
                style={{
                  left: `-${(crop.x / crop.width) * 100}%`,
                  top: `-${(crop.y / crop.height) * 100}%`,
                  width: `${(100 / crop.width) * 100}%`,
                  height: `${(100 / crop.height) * 100}%`,
                }}
              />
            </div>
            <div className="absolute inset-0 border border-white/20 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div></div>
            </div>
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full -top-2.5 -left-2.5 cursor-nwse-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'nw')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full -top-2.5 left-1/2 -translate-x-1/2 cursor-ns-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'n')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full -top-2.5 -right-2.5 cursor-nesw-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'ne')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full top-1/2 -left-2.5 -translate-y-1/2 cursor-ew-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'w')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full top-1/2 -right-2.5 -translate-y-1/2 cursor-ew-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'e')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full -bottom-2.5 -left-2.5 cursor-nesw-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'sw')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full -bottom-2.5 left-1/2 -translate-x-1/2 cursor-ns-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 's')} />
            <div className="absolute w-5 h-5 bg-white border-2 border-green-500 rounded-full -bottom-2.5 -right-2.5 cursor-nwse-resize z-10 hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, 'se')} />
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-900 border-t border-white/10 flex justify-end gap-4 z-20">
        <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-300 hover:bg-slate-800 font-medium transition-colors">
          Batal
        </button>
        <button
          onClick={handleApply}
          className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-colors flex items-center gap-2"
        >
          <Check size={18} /> Potong Gambar
        </button>
      </div>
    </div>
  );
};
