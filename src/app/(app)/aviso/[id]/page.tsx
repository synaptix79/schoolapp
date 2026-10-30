
import { formatAcademicLabel } from '@/lib/academic-levels';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Pin, UserRound } from 'lucide-react';

import { PageIntro } from '@/components/app/demo-blocks';
import { demoCommuniques } from '@/lib/demo';

export default async function AvisoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = demoCommuniques.find((item) => item.id === id);

  if (!notice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" aria-hidden />
        Volver al muro
      </Link>

      <PageIntro
        eyebrow={notice.category}
        title={formatAcademicLabel(notice.title)}
        description={notice.scope === 'global' ? 'Publicado para toda la comunidad educativa.' : `Publicado para: ${notice.grades.map(formatAcademicLabel).join(', ')}.`}
        aside={
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            Alcance: <span className="font-semibold text-foreground">{notice.scope === 'global' ? 'global' : 'por grado'}</span>
          </div>
        }
      />

      <article className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden />
            {notice.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4" aria-hidden />
            {notice.author}
          </span>
          {notice.pinned ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-accent px-2.5 py-1 font-semibold text-accent-foreground">
              <Pin className="size-4" aria-hidden />
              Fijado
            </span>
          ) : null}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-5">
          <div className="text-sm font-semibold text-muted-foreground">Imagen opcional demo</div>
          <div className="mt-3 flex aspect-[16/7] items-center justify-center rounded-md bg-accent text-center text-sm font-semibold text-accent-foreground">
            Aquí se mostraría la imagen del aviso si dirección la sube
          </div>
        </div>

        <p className="mt-6 text-base leading-8 text-foreground">{notice.body}</p>

        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-foreground">
          En la versión final, cada perfil verá únicamente los avisos que le corresponden según su grado y permisos.
        </div>
      </article>
    </div>
  );
}
