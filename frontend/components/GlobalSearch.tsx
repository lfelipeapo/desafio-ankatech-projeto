"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalSearch(){
  const [q,setQ] = useState('');
  const router = useRouter();
  function go(){ if(!q.trim()) return; router.push(`/clients?q=${encodeURIComponent(q)}`); }
  return (
    <div className="flex items-center gap-2">
      <input className="border rounded-xl px-3 py-2 bg-transparent" placeholder="Buscar clientes" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') go(); }} />
      <button className="border rounded-xl px-3 py-2" onClick={go}>Buscar</button>
    </div>
  );
}


