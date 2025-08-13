'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function Custodia(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {t:'Início do Período', v:'R$ 1.155B', s:'+24.3%'},
          {t:'Fim do Período', v:'R$ 1.400B', s:'+17.5%'},
          {t:'Variação Total', v:'+36.8%', s:' '},
        ].map((k)=> (
          <Card key={k.t}><CardHeader><CardTitle className="text-sm">{k.t}</CardTitle></CardHeader><CardContent>
            <div className="text-2xl font-semibold">{k.v}</div>
            {k.s && <div className="text-xs text-emerald-500 mt-1">{k.s}</div>}
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card><CardHeader><CardTitle>AuC</CardTitle></CardHeader><CardContent>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={[{m:'Jan',v:1100},{m:'Fev',v:1120},{m:'Mar',v:1180},{m:'Abr',v:1220},{m:'Mai',v:1300},{m:'Jun',v:1400}] }>
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Captação</CardTitle></CardHeader><CardContent>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={[{m:'Jan',v:50},{m:'Fev',v:40},{m:'Mar',v:80},{m:'Abr',v:60},{m:'Mai',v:90},{m:'Jun',v:100}] }>
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}


