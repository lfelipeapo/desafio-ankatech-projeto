'use client';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { currencyBR, percentBR, percentText } from '@/lib/format';

type Props = {
  title: string;
  value?: number|null;
  valuePrefix?: string;
  valueSuffix?: string;
  variation?: number|null; // 0.175 -> 17.5%
  className?: string;
  right?: ReactNode;
};
export default function StatCard({ title, value, valuePrefix='', valueSuffix='', variation, className, right }: Props) {
  const pct = percentBR(variation ?? null);
  const green = typeof pct === 'number' && pct >= 0;
  const chip = pct == null ? null : (
    <span className={cn('text-xs px-2 py-1 rounded-full', green ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
      {percentText(pct)}
    </span>
  );
  const formattedValue = typeof value === 'number'
    ? (valuePrefix.trimStart().startsWith('R$') ? currencyBR(value) : value.toLocaleString('pt-BR'))
    : '0';
  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 dark:bg-neutral-900 dark:border-neutral-800', className)}>
      <div className="flex items-start justify-between">
        <div className="text-sm text-neutral-500">{title}</div>
        {right || chip}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">
        {formattedValue}{valueSuffix}
      </div>
    </div>
  );
}
