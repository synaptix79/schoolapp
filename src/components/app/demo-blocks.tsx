
import { formatAcademicLabel } from '@/lib/academic-levels';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, Pin, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { demoCommuniques } from '@/lib/demo';

type Notice = (typeof demoCommuniques)[number];

const categoryStyles: Record<string, string> = {
  aviso: 'bg-accent text-accent-foreground',
  noticia: 'bg-secondary text-secondary-foreground',
  evento: 'bg-primary text-primary-foreground',
  urgente: 'bg-canaan-alerta-suave text-canaan-alerta'
};

export function PageIntro({
  eyebrow,
  title,
  description,
  aside
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/80 bg-card p-5 shadow-panel sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-md bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">{eyebrow}</span>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-8 text-muted-foreground">{description}</p>
        </div>
        {aside}
      </div>
    </section>
  );
}

export function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function NoticeCard({ notice, compact = false }: { notice: Notice; compact?: boolean }) {
  return (
    <Link
      href={`/aviso/${notice.id}`}
      className="group block rounded-lg border border-border/80 bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:border-primary/40 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('rounded-md px-2.5 py-1 text-xs font-bold uppercase', categoryStyles[notice.category] ?? categoryStyles.aviso)}>
          {notice.category}
        </span>
        {notice.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
            <Pin className="size-3" aria-hidden />
            Fijado
          </span>
        ) : null}
        <span className="text-xs font-semibold text-muted-foreground">{notice.date}</span>
      </div>
      <div className={cn('mt-4 font-semibold text-foreground', compact ? 'text-lg' : 'text-2xl')}>{formatAcademicLabel(notice.title)}</div>
      <p className={cn('mt-3 leading-7 text-muted-foreground', compact ? 'line-clamp-2 text-sm' : 'text-sm sm:text-base')}>{notice.body}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-medium text-muted-foreground">
          {notice.scope === 'global' ? 'Toda la comunidad' : `Grados: ${notice.grades.map(formatAcademicLabel).join(', ')}`}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          Ver aviso
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function QuickLink({ href, label, description, icon: Icon }: { href: string; label: string; description: string; icon: LucideIcon }) {
  return (
    <Link href={href} className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/40 hover:bg-muted/35">
      <span className="flex min-w-0 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{label}</span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
        </span>
      </span>
      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export function DemoTable({ columns, rows }: { columns: string[]; rows: Array<Array<ReactNode>> }) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index} className="bg-card">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 align-top text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PrivacyNote() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-foreground">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <div className="font-semibold">Privacidad de menores activa en el diseño</div>
          <p className="mt-1 text-muted-foreground">
            En esta versión las fotos son marcadores visuales. En la versión final se mostrarán solo a usuarios autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PrivatePhotoPlaceholder({ title, description, locked = false }: { title: string; description: string; locked?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <div className={cn('flex aspect-[4/3] items-center justify-center p-5 text-center', locked ? 'bg-muted' : 'bg-accent')}>
        <div>
          <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-card/85 text-primary shadow-soft">
            <LockKeyhole className="size-6" aria-hidden />
          </div>
          <div className="mt-3 text-sm font-bold text-foreground">{locked ? 'No visible para este perfil' : 'Foto privada demo'}</div>
        </div>
      </div>
      <div className="p-4">
        <div className="font-semibold text-foreground">{title}</div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
