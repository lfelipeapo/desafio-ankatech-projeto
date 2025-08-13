"use client";
import React, { ReactNode, useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: ()=>void; title?: string; children: ReactNode; footer?: ReactNode }){
  useEffect(()=>{
    function onKey(e: KeyboardEvent){ if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey); else document.removeEventListener('keydown', onKey as any);
    return ()=> document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl">
        {title && <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 text-sm font-semibold">{title}</div>}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}


