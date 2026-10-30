'use client';

import { formatAcademicLabel } from '@/lib/academic-levels';

import { useState } from 'react';
import { Check, ChevronDown, Loader2, RefreshCw, UserRound } from 'lucide-react';

import { useGuardianStudent } from '@/lib/guardian/student-context';
import { cn } from '@/lib/utils';

export function GuardianStudentSelector() {
  const {
    assignedStudents,
    selectedStudent,
    selectStudent,
    refreshStudents,
    isLoading,
    error,
  } = useGuardianStudent();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <section className="flex min-h-20 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Alumno seleccionado</p>
          <p className="text-sm font-semibold text-foreground">Cargando alumnos asignados…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-canaan-alerta/30 bg-canaan-alerta-suave/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-canaan-alerta">No se pudieron cargar los alumnos</p>
          <p className="text-sm text-foreground">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => void refreshStudents()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold"
        >
          <RefreshCw className="size-4" aria-hidden />
          Reintentar
        </button>
      </section>
    );
  }

  if (!selectedStudent) {
    return (
      <section className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
        <p className="font-semibold text-foreground">Todavía no tenés alumnos asignados a tu cuenta.</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Comunicate con la administración del colegio para solicitar la vinculación.
        </p>
      </section>
    );
  }

  return (
    <section className="relative rounded-xl border border-primary/25 bg-card p-3 shadow-soft">
      <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        Alumno seleccionado
      </p>
      <button
        type="button"
        disabled={assignedStudents.length === 1}
        aria-expanded={assignedStudents.length > 1 ? open : undefined}
        aria-haspopup={assignedStudents.length > 1 ? 'listbox' : undefined}
        onClick={() => assignedStudents.length > 1 && setOpen((current) => !current)}
        className="mt-1 flex min-h-14 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
      >
        <StudentAvatar name={selectedStudent.nombre} />
        <span className="min-w-0 flex-1">
          <span className="block break-words font-bold text-foreground">{selectedStudent.nombre}</span>
          <span className="block break-words text-sm text-muted-foreground">
            {studentSubtitle(selectedStudent)}
          </span>
        </span>
        {assignedStudents.length > 1 ? (
          <ChevronDown className={cn('size-5 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
        ) : (
          <span className="rounded-full bg-accent px-2 py-1 text-[11px] font-bold text-accent-foreground">Único</span>
        )}
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Seleccionar alumno"
          className="absolute inset-x-3 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-panel"
        >
          {assignedStudents.map((student) => {
            const active = student.id === selectedStudent.id;
            return (
              <button
                key={student.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  selectStudent(student.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex min-h-16 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted',
                  active && 'bg-primary/10',
                )}
              >
                <StudentAvatar name={student.nombre} />
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-semibold text-foreground">{student.nombre}</span>
                  <span className="block break-words text-xs text-muted-foreground">{studentSubtitle(student)}</span>
                </span>
                {active ? <Check className="size-4 text-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function StudentAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {initials || <UserRound className="size-5" aria-hidden />}
    </span>
  );
}

function studentSubtitle(student: {
  grado: string | null;
  seccion: string | null;
  turno: string | null;
  estado: string;
}) {
  return [
    [student.grado ? formatAcademicLabel(student.grado) : null, student.seccion].filter(Boolean).join(' · '),
    student.turno ? `Turno ${student.turno}` : null,
    student.estado === 'activo' ? 'Activo' : student.estado,
  ]
    .filter(Boolean)
    .join(' · ');
}

