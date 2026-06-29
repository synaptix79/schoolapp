import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import { PageIntro, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { demoChildren } from '@/lib/demo';

export default async function AlumnoPerfilPage({ params }: { params: Promise<{ alumnoId: string }> }) {
  const { alumnoId } = await params;
  const child = demoChildren.find((c) => c.id === alumnoId);

  if (!child) notFound();

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow={`Alumno · ${child.grado} · Perfil`}
        title={child.nombre}
        description={`Sección ${child.seccion} · Año lectivo ${child.anioLectivo}`}
      />

      <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
        {/* Photo */}
        <PrivatePhotoPlaceholder
          title={child.nombre}
          description="Foto de perfil privada — demo"
          locked={!child.consentimientoFotos}
        />

        {/* Main data */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <SectionTitle>Datos académicos</SectionTitle>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Nacimiento"     value={child.fechaNacimiento} />
            <Field label="Promedio"       value={child.promedio}        />
            <Field label="Asistencia"     value={child.asistencia}      />
            <Field label="Estado"         value={child.estado}          />
            <Field label="Fotos"          value={child.consentimientoFotos ? 'Con consentimiento' : 'Sin consentimiento'} />
            <Field label="Tutor/a"        value={child.tutor}           />
          </dl>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href={`/padre/${child.id}/calificaciones`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste">
              Ver académico <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href={`/padre/${child.id}/galeria`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              Ver entregables
            </Link>
          </div>
        </div>
      </div>

      {/* Medical + identity data */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <SectionTitle>Datos personales y de salud</SectionTitle>
        <p className="mb-4 mt-1 text-xs text-muted-foreground">
          Información sensible. Solo visible para tutores autorizados, docentes del grado y dirección.
        </p>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nº de CI"                 value={child.ci}                    sensitive />
          <Field label="Tipo de sangre"            value={child.tipoSangre}            sensitive />
          <Field label="Contacto de emergencia"    value={child.contactoEmergencia}    sensitive />
          <Field label="Alergias / observaciones"  value={child.observacionesMedicas}  sensitive className="sm:col-span-2 lg:col-span-3" />
        </dl>
      </div>

      {/* Privacy note */}
      <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold text-foreground">Vista privada del alumno</p>
          <p className="mt-0.5 text-muted-foreground">Solo los perfiles autorizados por la institución pueden consultar esta ficha.</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-foreground">{children}</h2>;
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
    <div className={`rounded-md border bg-muted/40 p-3 ${sensitive ? 'border-canaan-alerta/30 bg-canaan-alerta-suave/55' : 'border-border'} ${className ?? ''}`}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{String(value)}</dd>
    </div>
  );
}
