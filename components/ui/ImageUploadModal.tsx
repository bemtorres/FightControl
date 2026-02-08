'use client';

import { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onUrlSelect: (url: string) => void;
  title?: string;
}

export const ImageUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  onUrlSelect,
  title = "Select Image"
}: ImageUploadModalProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  const handleUrlConfirm = () => {
    if (imageUrl.trim()) {
      onUrlSelect(imageUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-210 flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Choose source</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X size={20} />
          </button>
        </header>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex p-1 bg-zinc-900 rounded-2xl mb-8 border border-zinc-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'upload' ? "bg-white text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Upload size={14} />
              Local File
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={clsx(
                "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'url' ? "bg-white text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <LinkIcon size={14} />
              Image URL
            </button>
          </div>

          <div className="min-h-[160px] flex flex-col justify-center">
            {activeTab === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/20 hover:bg-white/2 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-800 transition-all text-zinc-500 group-hover:text-white">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-300">Click to browse</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-bold">PNG, JPG or SVG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Network Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                      <Globe size={16} />
                    </div>
                    <input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUrlConfirm}
                  disabled={!imageUrl.trim()}
                  className="w-full py-4 bg-white text-zinc-950 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                  Confirm Image URL
                </button>
              </div>
            )}
          </div>
        </div>

        <footer className="p-4 bg-zinc-950/80 border-t border-zinc-800 flex justify-center">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Files are optimized after selection</p>
        </footer>
      </motion.div>
    </div>
  );
};
