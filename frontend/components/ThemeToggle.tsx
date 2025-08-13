"use client";
import { useState, useEffect, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';

type Props = { defaultDark: boolean };

export default function ThemeToggle({ defaultDark }: Props){
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(defaultDark);
  useEffect(()=>{ setChecked(defaultDark); }, [defaultDark]);
  function onCheckedChange(next: boolean){
    setChecked(next);
    startTransition(async ()=>{
      try{
        // Atualiza cookie via chamada para rota de ação
        await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dark: next })
        });
        const root = document.documentElement.classList;
        root.toggle('dark', next);
      }catch(_){/* noop */}
    });
  }
  return (
    <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={isPending} />
  );
}


