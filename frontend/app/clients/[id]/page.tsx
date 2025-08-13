'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PerformanceChart from '@/components/PerformanceChart';
import { Dialog, DialogContent, DialogCard, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Allocation, PerformancePoint } from '@/lib/types';
import { connectPriceWS } from '@/lib/ws';

async function getClient(id: string) {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

// Busca as alocações do cliente e enriquece cada item com o ticker do
// ativo associado. O backend não retorna o ticker no objeto de
// alocação, portanto precisamos buscar cada asset individualmente.
async function getAllocations(id: string) {
  const { data } = await api.get(`/clients/${id}/allocations`);
  const allocations = data as Allocation[];
  // Constrói mapa de asset_id -> ticker.
  const uniqueIds = Array.from(new Set(allocations.map((a) => a.asset_id)));
  const assets = await Promise.all(
    uniqueIds.map(async (aid) => {
      const res = await api.get(`/assets/${aid}`);
      return { id: aid, ticker: res.data.ticker };
    }),
  );
  const tickMap: Record<number, string> = {};
  assets.forEach((a) => (tickMap[a.id] = a.ticker));
  return allocations.map((a) => ({ ...a, ticker: tickMap[a.asset_id] }));
}

// Busca a curva de performance do cliente e retorna apenas o array de
// pontos. O endpoint retorna um objeto com `client_id` e `points`.
async function getPerformance(id: string) {
  const { data } = await api.get(`/clients/${id}/performance`);
  return (data?.points ?? []) as PerformancePoint[];
}

// Busca sugestões de ativos do Yahoo Finance. A API retorna objetos
// com `symbol` e `shortname`; mapeamos para { symbol, name } por
// simplicidade.
async function searchAssets(q: string) {
  const { data } = await api.get('/assets/search', { params: { q } });
  return (data as { symbol: string; shortname?: string }[]).map((item) => ({
    symbol: item.symbol,
    name: item.shortname || item.symbol,
  }));
}

export default function ClientDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  const qc = useQueryClient();
  const router = useRouter();
  const { data: client, error: errClient } = useQuery({ queryKey:['client',id], queryFn:()=>getClient(id), retry: false });
  const { data: allocs, error: errAllocs } = useQuery({ queryKey: ['allocs', id], queryFn: () => getAllocations(id), enabled: !!client, retry: false, refetchInterval: 5000 });
  const { data: perf, error: errPerf } = useQuery({ queryKey: ['perf', id], queryFn: () => getPerformance(id), enabled: !!client, retry: false, refetchInterval: 15000 });

  useEffect(()=>{
    const is404 = (e: any) => Number(e?.response?.status) === 404;
    if (is404(errClient) || is404(errAllocs) || is404(errPerf)){
      router.replace('/clients');
    }
  }, [errClient, errAllocs, errPerf, router]);

  const [tickerQuery,setTickerQuery] = useState('');
  const [tickerList,setTickerList] = useState<{symbol:string; name:string}[]>([]);
  const [symbol, setSymbol] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [qty,setQty] = useState<number>(0);
  const [buyPrice,setBuyPrice] = useState<number>(0);
  const [buyDate,setBuyDate] = useState<string>('');
  const [allocError, setAllocError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openEdit, setOpenEdit] = useState<null | Allocation>(null);

  async function handleSearch() {
    if (tickerQuery.length < 2) { setTickerList([]); return; }
    try{
      const r = await searchAssets(tickerQuery);
      setTickerList(r.slice(0, 10));
    }catch(_){
      // ignora erros (ex.: 422/externo) e não quebra a UI
      setTickerList([]);
    }
  }
  // Busca sugestões conforme o usuário digita (sem depender de blur)
  useEffect(()=>{ void handleSearch(); }, [tickerQuery]);

  async function addAllocation() {
    setAllocError(null);
    if (isProcessing) return;
    setIsProcessing(true);
    const inferred = (symbol || tickerQuery.split(/[\s-]/)[0] || '').toUpperCase();
    if (!inferred || qty <= 0 || buyPrice <= 0 || !buyDate) return;
    // Cria ou obtém o ativo antes de criar a alocação. Se já existe, o
    // endpoint devolve o asset existente.
    try{
      const assetRes = await api.post('/assets', { ticker: inferred, name: selectedName || inferred });
      const assetId = assetRes.data.id;
      await api.post('/allocations', {
        client_id: Number(id),
        asset_id: assetId,
        quantity: Number(qty),
        purchase_price: Number(buyPrice),
        purchase_date: buyDate,
      });
    }catch(err: any){
      const code = err?.response?.status;
      if (code === 403) setAllocError('Permissão negada: faça login como admin para criar alocação.');
      else setAllocError('Falha ao criar alocação');
      setIsProcessing(false);
      return;
    }
    setSymbol('');
    setSelectedName('');
    setTickerQuery('');
    setTickerList([]);
    setQty(0);
    setBuyPrice(0);
    setBuyDate('');
    // Após criar, refetch imediato para refletir na UI sem esperar foco/interação
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['allocs', id] }),
      qc.invalidateQueries({ queryKey: ['perf', id] }),
    ]);
    await Promise.all([
      qc.refetchQueries({ queryKey: ['allocs', id] }),
      qc.refetchQueries({ queryKey: ['perf', id] }),
    ]);
    setIsProcessing(false);
  }

  async function updateClient(fields: Partial<{name:string; email:string; is_active:boolean}>){
    await api.put(`/clients/${id}`, fields);
    await qc.invalidateQueries({ queryKey: ['client', id] });
  }
  async function deleteClient(){
    if (!confirm('Excluir cliente? Esta ação é irreversível.')) return;
    await api.delete(`/clients/${id}`);
    router.push('/clients');
  }

  async function saveEdit(a: Allocation, values: { ticker: string; quantity: number; price: number; date: string }){
    try{
      let assetId = a.asset_id;
      const symbolUpper = (values.ticker || '').toUpperCase().trim();
      if (symbolUpper && symbolUpper !== (a.ticker || '')){
        const res = await api.post('/assets', { ticker: symbolUpper, name: symbolUpper });
        assetId = res.data.id;
      }
      await api.put(`/allocations/${a.id}`, {
        asset_id: Number(assetId),
        quantity: Number(values.quantity),
        purchase_price: Number(values.price),
        purchase_date: values.date,
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['allocs', id] }),
        qc.invalidateQueries({ queryKey: ['perf', id] }),
      ]);
      await Promise.all([
        qc.refetchQueries({ queryKey: ['allocs', id] }),
        qc.refetchQueries({ queryKey: ['perf', id] }),
      ]);
    }catch{
    }finally{
      setOpenEdit(null);
      setIsProcessing(false);
    }
  }
  async function removeAllocation(a: Allocation){
    if (isProcessing) return;
    if (!confirm('Excluir alocação?')) return;
    setIsProcessing(true);
    await api.delete(`/allocations/${a.id}`);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['allocs', id] }),
      qc.invalidateQueries({ queryKey: ['perf', id] }),
    ]);
    await Promise.all([
      qc.refetchQueries({ queryKey: ['allocs', id] }),
      qc.refetchQueries({ queryKey: ['perf', id] }),
    ]);
    setIsProcessing(false);
  }

  return <div className="space-y-6">
    <Card className='shadow-card'><CardHeader><CardTitle>Dados do cliente</CardTitle></CardHeader><CardContent className='space-y-3'>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className='text-xs text-neutral-500'>Nome</label>
          <input className='w-full border rounded-xl px-3 py-2 bg-transparent' defaultValue={client?.name||''} onBlur={(e)=>updateClient({ name: e.target.value })} />
        </div>
        <div>
          <label className='text-xs text-neutral-500'>E‑mail</label>
          <input className='w-full border rounded-xl px-3 py-2 bg-transparent' defaultValue={client?.email||''} onBlur={(e)=>updateClient({ email: e.target.value })} />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-xs text-neutral-500'>Ativo?</label>
          <input type='checkbox' defaultChecked={!!client?.is_active} onChange={(e)=>updateClient({ is_active: e.target.checked })} />
        </div>
        <div className='text-right'>
          <Button variant='outline' onClick={deleteClient}>Excluir cliente</Button>
        </div>
      </div>
    </CardContent></Card>
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{client?.name}</h1>
      <a href={`/api/export?client_id=${id}`} className="underline text-sm">Exportar CSV/Excel</a>
    </div>

    <Card className='shadow-card'><CardHeader><CardTitle>Nova alocação</CardTitle></CardHeader><CardContent className='space-y-3'>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="relative">
          <Input placeholder="Buscar ticker" value={tickerQuery} onChange={e=>setTickerQuery(e.target.value)} />
          {tickerList.length>0 && <div className="absolute left-0 right-0 z-10 border rounded-xl mt-1 max-h-40 overflow-auto bg-white dark:bg-neutral-900">
            {tickerList.map((t) => (
              <button
                key={t.symbol}
                className="block w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => {
                  setSymbol(t.symbol);
                  setSelectedName(t.name);
                  setTickerList([]);
                  setTickerQuery(`${t.symbol} - ${t.name}`);
                }}
              >
                {t.symbol} — {t.name}
              </button>
            ))}
          </div>}
        </div>
        <Input
          placeholder="Quantidade"
          type="number"
          value={qty || ''}
          onChange={(e) => setQty(Number(e.target.value))}
        />
        <Input
          placeholder="Preço de compra"
          type="number"
          value={buyPrice || ''}
          onChange={(e) => setBuyPrice(Number(e.target.value))}
        />
        <Input
          placeholder="Data da compra"
          type="date"
          value={buyDate}
          onChange={(e) => setBuyDate(e.target.value)}
        />
        <Button onClick={addAllocation} disabled={isProcessing}>{isProcessing ? 'Processando…' : 'Adicionar'}</Button>
        {allocError && <div className='md:col-span-5 text-sm text-red-600'>{allocError}</div>}
      </div>
    </CardContent></Card>

    <Card className='shadow-card mt-6'><CardHeader><CardTitle>Alocações</CardTitle></CardHeader><CardContent className='space-y-2'>
      <Table>
        <TableHeader>
          <TableRow className="text-left border-b border-neutral-200 dark:border-neutral-800">
            <TableHead>Ticker</TableHead>
            <TableHead>Qtd</TableHead>
            <TableHead>Preço compra</TableHead>
            <TableHead>Preço atual</TableHead>
            <TableHead>Variação diária</TableHead>
            <TableHead>Rentab. acumulada</TableHead>
            <TableHead className='text-right'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocs?.map((a) => (
            <TableRow key={a.id} className="border-b border-neutral-100 dark:border-neutral-900">
              <TableCell>{a.ticker || a.asset_id}</TableCell>
              <TableCell>{a.quantity}</TableCell>
              <TableCell>{a.purchase_price}</TableCell>
              <LiveCells allocation={a} />
              <TableCell className='text-right'>
                <div className='flex gap-3 justify-end'>
                  <button className='underline disabled:opacity-50' disabled={isProcessing} onClick={()=>setOpenEdit(a)}>{isProcessing ? '...' : 'Editar'}</button>
                  <button className='text-rose-600 underline disabled:opacity-50' disabled={isProcessing} onClick={()=>removeAllocation(a)}>{isProcessing ? '...' : 'Excluir'}</button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>

    <Card className='shadow-card mt-6'><CardHeader><CardTitle>Performance</CardTitle></CardHeader><CardContent className='space-y-2'>
      <PerformanceChart data={perf || []} />
    </CardContent></Card>
  {openEdit && <EditAllocationModal allocation={openEdit} onClose={()=>setOpenEdit(null)} onSave={(vals)=>saveEdit(openEdit, vals)} />}
  </div>;
}

function LiveCells({ allocation }: { allocation: Allocation }){
  const [price, setPrice] = useState<number | null>(allocation.current_price ?? null);
  // Fallback HTTP: busca preço atual/quando WS indisponível
  async function fetchPriceHttp(symbol: string){
    try{
      const r = await api.get(`/prices/${encodeURIComponent(symbol)}`);
      const cur = r.data?.current as number | null | undefined;
      if (typeof cur === 'number') setPrice(cur);
    }catch{}
  }
  useEffect(()=>{
    if (!allocation.ticker) return;
    const ws = connectPriceWS(allocation.ticker);
    ws.onmessage = (ev)=>{
      try{ const d = JSON.parse(ev.data); if (typeof d.price === 'number') setPrice(d.price); }catch{}
    };
    // Fallback inicial via HTTP (caso WS ainda não entregue valor)
    fetchPriceHttp(allocation.ticker);
    return ()=> { try{ ws.close(); }catch{} };
  }, [allocation.ticker]);
  const daily = allocation.daily_change_pct;
  const profit = (typeof price === 'number' && allocation.purchase_price) ? (price - allocation.purchase_price) / allocation.purchase_price : allocation.profit_pct;
  return <>
    <TableCell>{typeof price === 'number' ? price.toFixed(2) : '-'}</TableCell>
    <TableCell>{typeof daily === 'number' ? (daily * 100).toFixed(2) + '%' : '-'}</TableCell>
    <TableCell>{typeof profit === 'number' ? (profit * 100).toFixed(2) + '%' : '-'}</TableCell>
  </>;
}

function EditAllocationModal({ allocation, onClose, onSave }:{ allocation: Allocation; onClose: ()=>void; onSave: (vals:{ticker:string;quantity:number;price:number;date:string})=>void }){
  const [ticker, setTicker] = useState(allocation.ticker || '');
  const [quantity, setQuantity] = useState(allocation.quantity);
  const [price, setPrice] = useState(allocation.purchase_price);
  const [date, setDate] = useState(allocation.purchase_date);
  return (
    <Dialog open onOpenChange={(v)=>{ if(!v) onClose(); }}>
      <DialogContent>
        <DialogCard>
          <DialogHeader>
            <DialogTitle>Editar alocação</DialogTitle>
            <DialogDescription>Atualize ticker, quantidade, preço e data da compra</DialogDescription>
          </DialogHeader>
          <div className='px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Input placeholder='Ticker' value={ticker} onChange={(e)=>setTicker(e.target.value)} />
            <Input type='number' placeholder='Quantidade' value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} />
            <Input type='number' placeholder='Preço de compra' value={price} onChange={(e)=>setPrice(Number(e.target.value))} />
            <Input type='date' placeholder='Data' value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={onClose}>Cancelar</Button>
            <Button onClick={()=> onSave({ ticker, quantity, price, date })}>Salvar</Button>
          </DialogFooter>
        </DialogCard>
      </DialogContent>
    </Dialog>
  );
}