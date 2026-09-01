'use client';

import React from 'react';
import { X, Play, ShieldCheck, Sparkles } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  title: string;
  onClose: () => void;
}

export default function VideoModal({ isOpen, videoUrl, title, onClose }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-white" /> DEMO VIDEO
            </span>
            <h3 className="font-bold text-sm truncate max-w-md">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          >
            Dein Browser unterstützt keine Videos.
          </video>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Geprüftes Verkäufer-Video (Echtheitsnachweis)</span>
          </div>

          <button
            onClick={onClose}
            className="bg-brand-600 text-white px-4 py-1.5 rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
}
