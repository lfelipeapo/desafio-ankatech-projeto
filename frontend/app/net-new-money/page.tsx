'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function NetNewMoney(){
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {t:'NNM 2024', v:'R$ 5M', s:'+17.5%'},
          {t:'NNM Semestral', v:'R$ 2.6M', s:'-17.5%'},
          {t:'NNM Mensal', v:'R$ 800K', s:'+3.0%'},
        ].map((k)=> (
          <Card key={k.t}><CardHeader><CardTitle className="text-sm">{k.t}</CardTitle></CardHeader><CardContent>
            <div className="text-2xl font-semibold">{k.v}</div>
            <div className="text-xs text-emerald-500 mt-1">{k.s}</div>
          </CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Net New Money</CardTitle></CardHeader><CardContent>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={[
              { m:'Jan', v: 500 },{ m:'Fev', v: 420 },{ m:'Mar', v: 610 },{ m:'Abr', v: 800 },{ m:'Mai', v: 760 },{ m:'Jun', v: 900 },
            ]}>
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#0ea5e9" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>
    </div>
  );
}


