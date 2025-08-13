'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Comissoes(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {t:'Receita Bruta', v:'R$ 1.8M', s:'+12.8%'},
          {t:'Receita Líquida', v:'R$ 1.7M', s:'+8.5%'},
          {t:'Comissão Total', v:'R$ 980K', s:'+9.3%'},
        ].map((k)=> (
          <Card key={k.t}><CardHeader><CardTitle className="text-sm">{k.t}</CardTitle></CardHeader><CardContent>
            <div className="text-2xl font-semibold">{k.v}</div>
            <div className="text-xs text-emerald-500 mt-1">{k.s}</div>
          </CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Detalhes por Assessor</CardTitle></CardHeader><CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left"><tr><th className="py-2">Nome</th><th>Receita Bruta</th><th>Receita Líquida</th><th>Comissão Total</th><th>Status</th></tr></thead>
            <tbody>
              {['Jane','Floyd','Ronald','Marvin','Jerome','Kathryn','Jacob','Kristin'].map((n,i)=> (
                <tr key={i} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="py-2">{n}</td>
                  <td>R$ 450K</td>
                  <td>R$ 410K</td>
                  <td>R$ 150K</td>
                  <td><span className="rounded-full px-2 py-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">cumpriu</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  );
}


