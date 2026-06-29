import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';

import { PageIntro } from '@/components/app/demo-blocks';
import { demoChildren } from '@/lib/demo';

export default function MisHijosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Alumno · selector"
        title="Selector de alumnos vinculados."
        description="Cuando haya más de un alumno asociado, se elige a quién consultar."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {demoChildren.slice(0, 2).map((child) => (
          <Link key={child.id} href={`/padre/${child.id}/perfil`} className="group rounded-lg border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Users className="size-5" aria-hidden />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-foreground">{child.nombre}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {child.grado} · Sección {child.seccion} · Promedio {child.promedio}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
