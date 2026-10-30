'use client';

import { formatAcademicLabel } from '@/lib/academic-levels';

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import { PageIntro, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { useGuardianStudent } from '@/lib/guardian/student-context';
import type { StudentDashboard } from '@/lib/guardian/types';
import { useStudentResource } from '@/lib/guardian/use-student-resource';

import { ErrorState, LoadingState } from './guardian-dashboard';

export function GuardianProfile() {
  const { selectedStudent } = useGuardianStudent();
  const { data, isLoading, error, reload } = useStudentResource<StudentDashboard>('dashboard');

  if (!selectedStudent) return null;
  if (isLoading) return <LoadingState message={`Cargando ficha de ${selectedStudent.nombre}…`} />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudo cargar la ficha.'} onRetry={() => void reload()} />;

  const alumno = data.student;

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow={`Padre/Encargado · ${formatAcademicLabel(alumno.grado ?? 'Alumno')} · Perfil`}
        title={alumno.nombre}
        description={`Sección ${alumno.seccion ?? 'Sin datos'} · Turno ${alumno.turno ?? 'Sin datos'}`}
      />

      <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
        <PrivatePhotoPlaceholder
          title={alumno.nombre}
          description="Foto de perfil privada — demo"
        />

        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold text-foreground">Datos académicos</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Nacimiento" value={alumno.fechaNacimiento} />
            <Field label="Última calificación" value={data.summary.latestGrade} />
            <Field
              label="Asistencia"
              value={data.summary.attendancePercentage === null ? null : `${data.summary.attendancePercentage}%`}
            />
            <Field label="Estado" value={alumno.estado} />
            <Field label="Vínculo" value={alumno.relationshipType} />
            <Field label="Encargado principal" value={alumno.isPrimary ? 'Sí' : 'No'} />
          </dl>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/padre/academico"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste"
            >
              Ver académico <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/padre/agenda"
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
            Solo el padre, encargado o personal autorizado puede consultar esta ficha.
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
  value: string | number | null;
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
      <dd className="mt-1 text-sm font-medium text-foreground">{value ?? 'Sin datos'}</dd>
    </div>
  );
}
