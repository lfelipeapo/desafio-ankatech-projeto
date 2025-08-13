"use client";
import React, { useEffect, useState } from 'react';

type Toast = { id: number; title?: string; description?: string; variant?: 'default'|'destructive' };
let pushToast: ((t: Omit<Toast,'id'>)=>void) | null = null;
export function useToast(){
  return {
    toast: (t: Omit<Toast,'id'>)=>{ pushToast?.(t); }
  };
}

export function Toaster(){
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(()=>{ pushToast = (t)=> setItems((prev)=> [...prev, { id: Date.now()+Math.random(), ...t }]); },[]);
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map((t)=> (
        <div key={t.id} className={`min-w-[260px] rounded-xl border px-4 py-3 shadow ${t.variant==='destructive' ? 'bg-rose-600/10 border-rose-600/30 text-rose-600' : 'bg-neutral-900 text-neutral-50 border-neutral-800'}`}>
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm opacity-80">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}


