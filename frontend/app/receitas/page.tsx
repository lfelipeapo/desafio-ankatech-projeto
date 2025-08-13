'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Receitas(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {t:'Receita Total em Janeiro', v:'R$ 7.16M', s:'+37.8%'},
          {t:'Total de Assessores', v:'30', s:' '},
          {t:'Receita por Assessor (%)', v:'—', s:' '},
        ].map((k)=> (
          <Card key={k.t}><CardHeader><CardTitle className="text-sm">{k.t}</CardTitle></CardHeader><CardContent>
            <div className="text-2xl font-semibold">{k.v}</div>
            {k.s && <div className="text-xs text-emerald-500 mt-1">{k.s}</div>}
          </CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Top 10 Assessores</CardTitle></CardHeader><CardContent>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={Array.from({length:10}).map((_,i)=>({ n:`Assessor ${i+1}`, v: Math.round(300+Math.random()*400) }))}>
              <XAxis dataKey="n" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="v" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>
    </div>
  );
}


