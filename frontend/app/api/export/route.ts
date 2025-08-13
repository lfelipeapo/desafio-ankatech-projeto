import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/** Proxy autenticado para o endpoint de exportação do backend */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const client_id = url.searchParams.get('client_id');
  const fmt = (url.searchParams.get('fmt') || 'csv').toLowerCase();
  const format = (url.searchParams.get('format') || 'csv').toLowerCase();
  if (!client_id) {
    return new NextResponse('Parâmetro client_id é obrigatório', { status: 400 });
  }
  // Base interna preferida para o backend (evita CORS e garante rede docker)
  const base = (process.env.INTERNAL_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000').replace(/\/$/, '');
  const token = cookies().get('access_token')?.value;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(`${base}/api/clients/${client_id}/positions?format=${encodeURIComponent(format)}` , {
    method: 'GET',
    headers,
    cache: 'no-store',
    redirect: 'manual',
  });
  // Propaga status (ex.: 401) para o cliente lidar
  const outHeaders = new Headers();
  const ct = resp.headers.get('Content-Type') || (format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
  outHeaders.set('Content-Type', ct);
  // Monta Content-Disposition padrão se backend não enviar
  const cd = resp.headers.get('Content-Disposition') || `attachment; filename="client_${client_id}_positions.${format === 'xlsx' ? 'xlsx' : 'csv'}"`;
  outHeaders.set('Content-Disposition', cd);
  return new NextResponse(resp.body, { status: resp.status, headers: outHeaders });
}