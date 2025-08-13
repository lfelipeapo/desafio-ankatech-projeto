'use client';
import Link from 'next/link';
import StatCard from '@/components/ui/stat-card';
export default function Home(){ return <div className="space-y-2">
  <h1 className="text-xl font-semibold">Bem-vindo</h1>
  <p><Link className="underline" href="/login">Ir para login</Link></p>

    {/* KPI cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Captado Anual" value={0} valuePrefix="R$ " valueSuffix=" M" variation={0.175} />
      <StatCard title="Captado Semestral" value={0} valuePrefix="R$ " valueSuffix=" M" variation={0.152} />
      <StatCard title="Captado Mensal" value={0} valuePrefix="R$ " valueSuffix=" M" variation={0.088} />
      <StatCard title="Atualização" right={<span className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</span>} />
    </div>

</div> }