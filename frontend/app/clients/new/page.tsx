'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toaster';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, { message: 'Informe um nome com pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'E‑mail inválido' }),
});
type Form = z.infer<typeof schema>;

export default function NewClient() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  async function onSubmit(values: Form) {
    setIsSubmitting(true);
    try {
      // O endpoint de criação de clientes aceita apenas `name` e `email`.
      await api.post('/clients', values);
      toast({ title: 'Sucesso', description: `Cliente ${values.name} criado com sucesso` });
      router.push('/clients');
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar cliente', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Card className='max-w-md mx-auto shadow-card'>
      <CardHeader>
        <CardTitle>Novo cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-3">
          <Input placeholder="Nome" {...register('name')} />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          <Input placeholder="Email" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}