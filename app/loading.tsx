import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#E9F7F1] flex items-center justify-center text-[#17A673] animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-[#17A673]" />
        </div>
        <div className="flex items-center gap-1.5 leading-none select-none">
          <span className="text-base font-black text-[#151815] tracking-tight">KLEIN</span>
          <span className="bg-[#17A673] text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded tracking-wider">
            DEAL.DE
          </span>
        </div>
      </div>
    </div>
  );
}
