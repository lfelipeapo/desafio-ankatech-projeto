'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Client } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import Badge from '@/components/ui/badge';
import { useToast } from '@/components/ui/toaster';

/**
 * Busca a lista de clientes a partir do backend. O backend utiliza
 * parâmetros de paginação baseados em `skip` (offset) e `limit`, e
 * aceita filtros `search` (nome ou e-mail) e `is_active` (true/false).
 * Aqui convertimos nossos parâmetros de página e status para o formato
 * esperado pelo backend e em seguida encapsulamos a resposta em um
 * objeto com informações de paginação para a UI. Como o backend não
 * retorna a contagem total, usamos o tamanho da lista retornada como
 * `total` apenas para manter a interface simples.
 */
async function fetchClients(params: {
  q?: string;
  status?: 'all' | 'active' | 'inactive';
  page: number;
  limit: number;
}) {
  const { q, status, page, limit } = params;
  const apiParams: Record<string, any> = {
    skip: (page - 1) * limit,
    limit,
  };
  if (q) apiParams.search = q;
  if (status && status !== 'all') apiParams.is_active = status === 'active';

  const { data } = await api.get('/clients', { params: apiParams });
  const list = data as Client[];
  return { items: list, total: list.length, page, limit };
}

export default function ClientsPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const params = useSearchParams();
  const [q, setQ] = useState(params?.get('q') || '');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>(
    (params?.get('status') as any) || 'all'
  );
  const [page, setPage] = useState(Number(params?.get('page') || '1'));
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { q, status, page, limit }],
    queryFn: () => fetchClients({ q: q || undefined, status, page, limit }),
  });

  const canGoNext = !!data?.items && data.items.length === limit;
  const currentPage = data?.page ?? page;
  function syncUrl(next?: Partial<{ q:string; status:string; page:number }>) {
    const url = new URL(window.location.href);
    if (next?.q !== undefined) {
      if (next.q) url.searchParams.set('q', next.q); else url.searchParams.delete('q');
    }
    if (next?.status !== undefined) {
      if (next.status) url.searchParams.set('status', next.status); else url.searchParams.delete('status');
    }
    if (next?.page !== undefined) {
      url.searchParams.set('page', String(next.page));
    }
    router.replace(url.pathname + (url.search || ''));
  }
  async function toggleActive(c: Client){
    try {
      await api.put(`/clients/${c.id}`, { is_active: !c.is_active });
      await qc.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Sucesso', description: `Cliente ${c.name} ${!c.is_active ? 'ativado' : 'desativado'} com sucesso` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao alterar status do cliente', variant: 'destructive' });
    }
  }
  async function removeClient(c: Client){
    if (!confirm(`Excluir cliente ${c.name}?`)) return;
    try {
      await api.delete(`/clients/${c.id}`);
      await qc.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Sucesso', description: `Cliente ${c.name} excluído com sucesso` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir cliente', variant: 'destructive' });
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nome ou e-mail"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter'){ setPage(1); syncUrl({ q, status, page:1 }); qc.invalidateQueries({ queryKey:['clients'] }); }}}
          />
          <select
            className="border rounded-xl px-3 py-2"
            value={status}
            onChange={(e) => { const v = e.target.value as any; setStatus(v); setPage(1); syncUrl({ q, status:v, page:1 }); qc.invalidateQueries({ queryKey:['clients'] }); }}
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <Button onClick={() => { setPage(1); syncUrl({ q, status, page:1 }); qc.invalidateQueries({ queryKey: ['clients'] }); }}>
            Atualizar
          </Button>

          <Link href="/clients/new">
            <Button variant="outline">Novo cliente</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Spinner />
            Carregando...
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="text-left border-b border-neutral-200 dark:border-neutral-800">
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.items?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-sm text-neutral-500"
                    >
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.items?.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-b border-neutral-100 dark:border-neutral-900"
                    >
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>
                        <Badge color={c.is_active ? 'green' : 'default'}>
                          {c.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <button className="ml-2 text-xs underline" onClick={()=>toggleActive(c)}>
                          Alterar
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-3 justify-end">
                          <Link href={`/clients/${c.id}`} className="underline">Detalhes</Link>
                          <button className="text-rose-600 underline" onClick={()=>removeClient(c)}>Excluir</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => { const next = Math.max(1, currentPage - 1); setPage(next); syncUrl({ q, status, page: next }); }}
                disabled={currentPage <= 1}
              >
                Anterior
              </Button>
              <span>Página {currentPage}</span>
              <Button
                variant="ghost"
                onClick={() => { if(!canGoNext) return; const next = currentPage + 1; setPage(next); syncUrl({ q, status, page: next }); }}
                disabled={!canGoNext}
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
