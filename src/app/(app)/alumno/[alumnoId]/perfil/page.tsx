
import { formatAcademicLabel } from '@/lib/academic-levels';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import { PageIntro, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { demoChildren } from '@/lib/demo';

export default async function AlumnoPerfilPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>;
}) {
  const { alumnoId } = await params;
  const alumno = demoChildren.find((child) => child.id === alumnoId);
  if (!alumno) notFound();

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow={`Alumno · ${formatAcademicLabel(alumno.grado)} · Perfil`}
        title={alumno.nombre}
        description={`Sección ${alumno.seccion} · Año lectivo ${alumno.anioLectivo}`}
      />

      <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
        <PrivatePhotoPlaceholder
          title={alumno.nombre}
          description="Foto de perfil privada — demo"
          locked={!alumno.consentimientoFotos}
        />

        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold text-foreground">Datos académicos</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Nacimiento" value={alumno.fechaNacimiento} />
            <Field label="Promedio" value={alumno.promedio} />
            <Field label="Asistencia" value={alumno.asistencia} />
            <Field label="Estado" value={alumno.estado} />
            <Field
              label="Fotos"
              value={alumno.consentimientoFotos ? 'Con consentimiento' : 'Sin consentimiento'}
            />
            <Field label="Tutor/a" value={alumno.tutor} />
          </dl>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/alumno/${alumno.id}/calificaciones`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste"
            >
              Ver académico <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={`/alumno/${alumno.id}/galeria`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Ver entregables
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="text-base font-bold text-foreground">Datos personales y de salud</h2>
        <p className="mb-4 mt-1 text-xs text-muted-foreground">
          Información sensible. Solo visible para perfiles autorizados por la institución.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="N.º de CI" value={alumno.ci} sensitive />
          <Field label="Tipo de sangre" value={alumno.tipoSangre} sensitive />
          <Field label="Contacto de emergencia" value={alumno.contactoEmergencia} sensitive />
          <Field
            label="Alergias / observaciones"
            value={alumno.observacionesMedicas}
            sensitive
            className="sm:col-span-2 lg:col-span-3"
          />
        </dl>
      </div>

      <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold text-foreground">Vista privada del alumno</p>
          <p className="mt-0.5 text-muted-foreground">
            Solo los perfiles autorizados por la institución pueden consultar esta ficha.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  sensitive = false,
  className,
}: {
  label: string;
  value: string | number | boolean;
  sensitive?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border bg-muted/40 p-3 ${
        sensitive ? 'border-canaan-alerta/30 bg-canaan-alerta-suave/55' : 'border-border'
      } ${className ?? ''}`}
    >
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{String(value)}</dd>
    </div>
  );
}

