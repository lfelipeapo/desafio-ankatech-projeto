'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Spinner from '@/components/ui/spinner';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Client } from '@/lib/types';
import LivePrice from '@/components/LivePrice';
import PerformanceChart from '@/components/PerformanceChart';
import { useDashboardPrices } from '@/lib/ws';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Calendar } from 'lucide-react';

async function fetchClients(){
  const { data } = await api.get('/clients', { params: { skip: 0, limit: 50 } });
  return data as Client[];
}

export default function Dashboard(){
  const { data, isLoading, error } = useQuery({ queryKey:['dash','clients'], queryFn: fetchClients });
  const { prices, isConnected, lastUpdated } = useDashboardPrices();
  
  // Evita mismatch de hidratação: data/hora deve ser preenchida apenas no cliente
  const [today, setToday] = useState<string>('');
  useEffect(()=>{ setToday(new Date().toLocaleDateString()); }, []);
  
  const total = data?.length ?? 0;
  const active = data?.filter(c=>c.is_active).length ?? 0;
  const inactive = total - active;

  // Dados simulados para demonstração
  const portfolioValue = 2847392.50;
  const dailyChange = 15847.32;
  const dailyChangePercent = 0.56;
  const monthlyReturn = 8.8;
  const yearlyReturn = 17.5;

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {portfolioValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {dailyChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={dailyChange > 0 ? 'text-green-500' : 'text-red-500'}>
                {dailyChange > 0 ? '+' : ''}R$ {Math.abs(dailyChange).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({dailyChangePercent > 0 ? '+' : ''}{dailyChangePercent}%)
              </span>
              <span>hoje</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
            <p className="text-xs text-muted-foreground">
              {total} total ({inactive} inativos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade Anual</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+{yearlyReturn}%</div>
            <p className="text-xs text-muted-foreground">
              Mensal: +{monthlyReturn}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" suppressHydrationWarning>
              {today || '—'}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance do Portfólio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolução da rentabilidade acumulada nos últimos 6 meses
          </p>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={[]} />
        </CardContent>
      </Card>

      {/* Preços em Tempo Real */}
      {prices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Preços em Tempo Real
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {lastUpdated && (
                  <span>Atualizado às {lastUpdated.toLocaleTimeString()}</span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {prices.slice(0, 8).map((price, index) => (
                <div key={price.ticker || index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{price.ticker}</span>
                    {price.change_percent && (
                      <span className={`text-xs flex items-center gap-1 ${
                        price.change_percent > 0 ? 'text-green-500' : 
                        price.change_percent < 0 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {price.change_percent > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : price.change_percent < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {price.change_percent > 0 ? '+' : ''}{price.change_percent.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    ${price.price.toFixed(2)}
                  </div>
                  {price.change && (
                    <div className={`text-xs ${
                      price.change > 0 ? 'text-green-500' : 
                      price.change < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {price.change > 0 ? '+' : ''}${price.change.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              Carregando…
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">Erro ao carregar clientes</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b">
                  <tr>
                    <th className="py-3 font-medium">Nome</th>
                    <th className="py-3 font-medium">E-mail</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {(data ?? []).map((c)=> (
                    <tr key={c.id} className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-muted-foreground">{c.email}</td>
                      <td className="py-3">
                        <Badge color={c.is_active ? 'green' : 'default'}>
                          {c.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!data || data.length===0) && !isLoading && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Price Component */}
      <LivePrice />
    </div>
  );
}


