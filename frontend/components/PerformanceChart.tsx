'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PerformancePoint } from '@/lib/types';

/**
 * Gráfico de linha para a série de rentabilidade acumulada de um cliente.
 * Recebe um array de pontos com `date` e `cumulative_return` e plota
 * usando `recharts`. O eixo Y é formatado em porcentagem.
 */
export default function PerformanceChart({ data }: { data: PerformancePoint[] }) {
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<PerformancePoint[]>([]);

  useEffect(() => { 
    setMounted(true); 
    
    // Se não há dados, gera dados simulados para demonstração
    if (!data || data.length === 0) {
      const simulatedData: PerformancePoint[] = [];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // 6 meses atrás
      
      let cumulativeReturn = 0;
      
      for (let i = 0; i < 180; i++) { // 6 meses de dados diários
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Simula variação diária entre -2% e +2%
        const dailyChange = (Math.random() - 0.5) * 0.04;
        cumulativeReturn = cumulativeReturn + dailyChange;
        
        simulatedData.push({
          date: date.toISOString().split('T')[0],
          cumulative_return: cumulativeReturn
        });
      }
      
      setChartData(simulatedData);
    } else {
      setChartData(data);
    }
  }, [data]);

  if (!mounted) return <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />;
  
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => (v * 100).toFixed(1) + '%'}
          />
          <Tooltip 
            formatter={(v: any) => [
              typeof v === 'number' ? (v * 100).toFixed(2) + '%' : v,
              'Rentabilidade'
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="cumulative_return" 
            dot={false} 
            stroke="#0ea5e9" 
            strokeWidth={2}
            activeDot={{ r: 4, stroke: '#0ea5e9', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}