'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageUtils';
import { X, RotateCw, Check, Scissors, RotateCcw, FlipHorizontal, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface ImageEditorModalProps {
  image: string | null;
  aspect?: number;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
}

export const ImageEditorModal = ({ image, aspect = 1, onClose, onSave }: ImageEditorModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [isFreeCrop, setIsFreeCrop] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation, flip);
      if (croppedImage) {
        onSave(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Scissors size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Edit Portrait</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Crop, Rotate & Mirror</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X size={20} />
          </button>
        </header>

        <div className="relative h-[400px] bg-zinc-950">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={isFreeCrop ? undefined : aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            transform={`translate(${crop.x}px, ${crop.y}px) rotateZ(${rotation}deg) scale(${zoom}) scaleX(${flip.horizontal ? -1 : 1})`}
          />
        </div>

        <footer className="p-6 bg-zinc-950/50 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-[2] space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Zoom Level</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e: any) => setZoom(e.target.value)}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="flex-1 flex gap-2 justify-end">
              <button
                onClick={() => setIsFreeCrop(!isFreeCrop)}
                className={clsx(
                  "px-4 py-3 rounded-xl transition-all border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                  isFreeCrop ? "bg-blue-500 text-white border-blue-400" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                )}
                title="Toggle Aspect Ratio"
              >
                <Layout size={14} />
                {isFreeCrop ? 'Custom' : 'Fixed'}
              </button>
              <button
                onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                className={clsx(
                  "p-3 rounded-xl transition-all border",
                  flip.horizontal ? "bg-emerald-500 text-zinc-950 border-emerald-500" : "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                )}
                title="Mirror Horizontal"
              >
                <FlipHorizontal size={20} />
              </button>
              <button
                onClick={() => setRotation(rotation - 90)}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-all border border-zinc-700"
                title="Rotate Counter-Clockwise"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setRotation(rotation + 90)}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-all border border-zinc-700"
                title="Rotate Clockwise"
              >
                <RotateCw size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
            >
              <Check size={18} /> Apply Changes
            </button>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
