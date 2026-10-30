'use client';
import { formatAcademicLabel } from '@/lib/academic-levels';


import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  Users,
  CheckCircle2,
  Clock,
  PenLine,
} from 'lucide-react';

import { demoAlumnosPorGrado, demoAnotaciones, demoGrades, demoDocentePerfil } from '@/lib/demo';

const TODAY = '2026-06-26';

function findGradeInfo(gradoLabel: string) {
  // '3.º EEB A' → grado='3.º EEB', seccion='A'
  const last = gradoLabel.lastIndexOf(' ');
  const grado = gradoLabel.slice(0, last);
  const seccion = gradoLabel.slice(last + 1);
  return demoGrades.find((g) => g.grado === grado && g.seccion === seccion);
}

export function MisGradosAccordion() {
  const [openGrado, setOpenGrado] = useState<string | null>(null);
  const grados = demoDocentePerfil.grados;

  return (
    <div className="space-y-3">
      {grados.map((gradoLabel) => {
        const info = findGradeInfo(gradoLabel);
        const alumnos = demoAlumnosPorGrado[gradoLabel] ?? [];
        const hoyAnnots = demoAnotaciones.filter(
          (a) => a.grado === gradoLabel && a.fecha === TODAY
        );
        const countCompletadas = hoyAnnots.filter((a) => a.estado === 'completada').length;
        const countBorradores = hoyAnnots.filter((a) => a.estado === 'borrador').length;
        const isOpen = openGrado === gradoLabel;

        return (
          <div key={gradoLabel} className="overflow-hidden rounded-lg border border-border bg-card">
            {/* ── Header ── */}
            <button
              onClick={() => setOpenGrado(isOpen ? null : gradoLabel)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="font-bold text-foreground">{formatAcademicLabel(gradoLabel)}</p>
                  <p className="text-xs text-muted-foreground">
                    {info?.alumnos ?? alumnos.length} alumnos · Año lectivo{' '}
                    {info?.anioLectivo ?? 2026}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Annotation summary (desktop) */}
                <div className="hidden items-center gap-3 text-xs sm:flex">
                  {hoyAnnots.length === 0 ? (
                    <span className="text-muted-foreground">Sin anotaciones hoy</span>
                  ) : (
                    <>
                      {countCompletadas > 0 && (
                        <span className="flex items-center gap-1 text-primary">
                          <CheckCircle2 className="size-3.5" />
                          {countCompletadas} completada{countCompletadas > 1 ? 's' : ''}
                        </span>
                      )}
                      {countBorradores > 0 && (
                        <span className="flex items-center gap-1 text-canaan-alerta">
                          <Clock className="size-3.5" />
                          {countBorradores} borrador{countBorradores > 1 ? 'es' : ''}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {isOpen ? (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* ── Expanded body ── */}
            {isOpen && (
              <div className="border-t border-border">
                {/* Student list */}
                <ul className="divide-y divide-border">
                  {alumnos.map((alumno) => {
                    const perAlumno = hoyAnnots.filter((a) => a.alumnoId === alumno.id);
                    const hasPage = alumno.id.startsWith('alumno-');

                    return (
                      <li
                        key={alumno.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                          {alumno.nombre.charAt(0)}
                        </span>
                        <span className="flex-1 text-sm font-medium text-foreground">
                          {alumno.nombre}
                        </span>
                        {perAlumno.length > 0 && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {perAlumno.length} anot.
                          </span>
                        )}
                        {hasPage ? (
                          <Link
                            href={`/padre/${alumno.id}/calificaciones`}
                            className="shrink-0 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            Ver académico
                          </Link>
                        ) : (
                          <span className="shrink-0 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground opacity-50">
                            Demo
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Grade-level action */}
                <div className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/20 px-4 py-3">
                  <Link
                    href="/profesor/calificaciones"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-canaan-celeste"
                  >
                    <PenLine className="size-3.5" aria-hidden />
                    Ir al Centro de carga
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Cargá anotaciones y boletines desde el menú Calificaciones.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
