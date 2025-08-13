'use client';
export const dynamic = 'force-dynamic';
import { Suspense, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return <Suspense fallback={<div />}>
    <LoginContent />
  </Suspense>;
}

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const search = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const form = new URLSearchParams();
      form.set('username', username);
      form.set('password', password);
      await api.post('/token', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: true });
      const next = search?.get('next') || '/dashboard';
      // Aguarda um pouco para garantir que o cookie foi definido
      setTimeout(() => {
        router.push(next);
      }, 100);
    } catch (err: any) {
      setError('Login inválido');
    } finally { setLoading(false); }
  }

  return <div className="max-w-sm mx-auto">
    <h1 className="text-xl font-semibold mb-4">Entrar</h1>
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="E-mail" value={username} onChange={e => setUsername(e.target.value)} />
      <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button disabled={loading} type="submit">{loading ? 'Entrando...' : 'Entrar'}</Button>
    </form>
  </div>;
}