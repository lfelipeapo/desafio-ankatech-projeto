import React from 'react';

export default function Badge({ children, color = 'default' }: { children: React.ReactNode; color?: 'default'|'green'|'red'|'blue' }){
	const cls = color === 'green' ? 'bg-emerald-600/15 text-emerald-500' : color === 'red' ? 'bg-rose-600/15 text-rose-500' : color === 'blue' ? 'bg-sky-600/15 text-sky-500' : 'bg-neutral-600/15 text-neutral-500';
	return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}


