'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, FileImage, FileText, ImageUp, PencilLine, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { demoAlumnosPorGrado, demoToday } from '@/lib/demo';
import type { Entrega, Tarea } from '@/lib/demo';

type EstadoLectura = 'terminado_en_clase' | 'pendiente' | 'entregado_en_revision' | 'entregado_corregido' | 'no_entrego';

const ESTADO: Record<
  EstadoLectura,
  {
    alumnoLabel: string;
    profesorLabel: string;
    icon: typeof CheckCircle2;
    pill: string;
  }
> = {
  terminado_en_clase: {
    alumnoLabel: 'Terminado en clase',
    profesorLabel: 'Terminado en clase',
    icon: CheckCircle2,
    pill: 'bg-accent text-primary border-border'
  },
  pendiente: {
    alumnoLabel: 'Tarea',
    profesorLabel: 'Sin entregar',
    icon: Clock3,
    pill: 'bg-canaan-alerta-suave text-canaan-alerta border-canaan-alerta/30'
  },
  entregado_en_revision: {
    alumnoLabel: 'Entregado · en revisión',
    profesorLabel: 'Entregado · corregir',
    icon: Clock3,
    pill: 'bg-canaan-celeste-suave text-primary border-border'
  },
  entregado_corregido: {
    alumnoLabel: 'Entregado · corregido',
    profesorLabel: 'Corregido',
    icon: CheckCircle2,
    pill: 'bg-accent text-primary border-border'
  },
  no_entrego: {
    alumnoLabel: 'No entregó',
    profesorLabel: 'No entregó',
    icon: XCircle,
    pill: 'bg-canaan-alerta-suave text-canaan-alerta border-canaan-alerta/30'
  }
};

type CorrectionDraft = {
  puntos: string;
  nota: string;
};

export function TareasAlumnoView({
  tareas,
  entregas,
  alumnoId
}: {
  tareas: Tarea[];
  entregas: Entrega[];
  alumnoId: string;
}) {
  const [localEntregas, setLocalEntregas] = useState<Entrega[]>(entregas);
  const [uploadNames, setUploadNames] = useState<Record<string, string>>({});

  const myEntregas = useMemo(
    () => Object.fromEntries(localEntregas.filter((e) => e.alumnoId === alumnoId).map((e) => [e.tareaId, e])),
    [localEntregas, alumnoId]
  );

  function handleUpload(tarea: Tarea, fileName: string) {
    setUploadNames((current) => ({ ...current, [tarea.id]: fileName }));
    setLocalEntregas((current) => {
      const nextEntrega: Entrega = {
        id: `entrega-demo-${tarea.id}-${alumnoId}`,
        tareaId: tarea.id,
        alumnoId,
        estado: 'entregado_en_revision',
        archivoEntregaUrl: `tareas/entregas/${alumnoId}/${fileName}`,
        puntos: null,
        notaCorreccion: null,
        entregadoAt: demoToday,
        corregidoAt: null
      };
      const exists = current.some((entrega) => entrega.tareaId === tarea.id && entrega.alumnoId === alumnoId);
      return exists
        ? current.map((entrega) => (entrega.tareaId === tarea.id && entrega.alumnoId === alumnoId ? nextEntrega : entrega))
        : [...current, nextEntrega];
    });
  }

  if (tareas.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">No hay actividades asignadas por ahora.</div>;
  }

  return (
    <div className="space-y-3">
      {tareas.map((tarea) => {
        const entrega = myEntregas[tarea.id];
        const estado = resolveEstadoEntrega(tarea, entrega);
        const cfg = ESTADO[estado];
        const Icon = cfg.icon;
        const canUpload = tarea.modalidad === 'tarea' && estado === 'pendiente' && Boolean(tarea.venceAt) && demoToday <= tarea.venceAt!;

        return (
          <article key={tarea.id} className="rounded-lg border border-border bg-background p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">{tarea.materia}</span>
                  <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {tarea.modalidad === 'terminado_en_clase' ? 'Terminado en clase' : `Tarea · vence ${formatDate(tarea.venceAt)}`}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-foreground">{tarea.titulo}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{tarea.consigna}</p>

                {tarea.archivoUrl ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-primary">
                    <FileText className="size-4" aria-hidden />
                    Material privado del docente
                  </div>
                ) : null}

                {estado === 'entregado_corregido' && (
                  <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
                    <p className="font-semibold text-primary">Corrección: {entrega?.puntos ?? 0} puntos</p>
                    {entrega?.notaCorreccion ? <p className="mt-1 leading-6 text-muted-foreground">{entrega.notaCorreccion}</p> : null}
                  </div>
                )}

                {estado === 'entregado_en_revision' ? (
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                    <FileImage className="size-4 text-primary" aria-hidden />
                    Imagen recibida: {uploadNames[tarea.id] ?? entrega?.archivoEntregaUrl?.split('/').pop() ?? 'entrega.jpg'}
                  </div>
                ) : null}

                {estado === 'no_entrego' ? (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-canaan-alerta/30 bg-canaan-alerta-suave px-3 py-2 text-sm text-canaan-alerta">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                    El cierre ya pasó y no hay entrega registrada.
                  </div>
                ) : null}
              </div>

              <span className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold', cfg.pill)}>
                <Icon className="size-3.5" aria-hidden />
                {cfg.alumnoLabel}
                {estado === 'entregado_corregido' && entrega?.puntos != null ? ` · ${entrega.puntos}` : ''}
              </span>
            </div>

            {canUpload ? (
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary/30 bg-card px-4 py-5 text-center text-sm transition-colors hover:bg-accent">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) handleUpload(tarea, file.name);
                  }}
                />
                <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ImageUp className="size-5" aria-hidden />
                </span>
                <span className="font-bold text-foreground">Subir imagen de la resolución</span>
                <span className="text-xs text-muted-foreground">Disponible hasta el cierre del {formatDate(tarea.venceAt)}.</span>
              </label>
            ) : null}

            <p className="mt-3 text-[11px] text-muted-foreground">Asignada el {formatDate(tarea.asignadaAt)} · {tarea.profesor}</p>
          </article>
        );
      })}
    </div>
  );
}

export function TareasProfesorSection({
  tareas,
  entregas
}: {
  tareas: Tarea[];
  entregas: Entrega[];
}) {
  const [localTareas, setLocalTareas] = useState<Tarea[]>(tareas);
  const [localEntregas, setLocalEntregas] = useState<Entrega[]>(entregas);
  const [titulo, setTitulo] = useState('Resolver guía de fracciones');
  const [materia, setMateria] = useState('Ciencias Naturales');
  const [modalidad, setModalidad] = useState<Tarea['modalidad']>('tarea');
  const [venceAt, setVenceAt] = useState('2026-06-30');
  const [consigna, setConsigna] = useState('Subir una foto clara de la resolución antes del cierre.');
  const [correcciones, setCorrecciones] = useState<Record<string, CorrectionDraft>>({});

  function handleCreate() {
    if (!titulo.trim() || !consigna.trim()) return;

    const nueva: Tarea = {
      id: `tarea-demo-${Date.now()}`,
      grado: '3.º EEB',
      materia,
      profesorId: 'demo-profesor',
      profesor: 'Prof. Marta Benítez',
      titulo: titulo.trim(),
      consigna: consigna.trim(),
      archivoUrl: 'tareas/demo/actividad-docente.pdf',
      modalidad,
      asignadaAt: demoToday,
      venceAt: modalidad === 'tarea' ? venceAt : null,
      createdAt: `${demoToday}T09:00:00-04:00`
    };

    setLocalTareas((current) => [nueva, ...current]);
    setTitulo('');
    setConsigna('');
  }

  function handleCorrect(tarea: Tarea, alumnoId: string) {
    const key = draftKey(tarea.id, alumnoId);
    const draft = correcciones[key] ?? { puntos: '9', nota: 'Buen trabajo. Revisar el orden de los pasos.' };
    const puntos = Number(draft.puntos || 0);

    setLocalEntregas((current) => {
      const exists = current.some((entrega) => entrega.tareaId === tarea.id && entrega.alumnoId === alumnoId);
      const corrected: Entrega = {
        id: `entrega-demo-${tarea.id}-${alumnoId}`,
        tareaId: tarea.id,
        alumnoId,
        estado: 'entregado_corregido',
        archivoEntregaUrl: current.find((entrega) => entrega.tareaId === tarea.id && entrega.alumnoId === alumnoId)?.archivoEntregaUrl ?? 'tareas/entregas/demo.jpg',
        puntos,
        notaCorreccion: draft.nota,
        entregadoAt: current.find((entrega) => entrega.tareaId === tarea.id && entrega.alumnoId === alumnoId)?.entregadoAt ?? demoToday,
        corregidoAt: demoToday
      };
      return exists
        ? current.map((entrega) => (entrega.tareaId === tarea.id && entrega.alumnoId === alumnoId ? corrected : entrega))
        : [...current, corrected];
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileText className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Crear actividad del perfil del alumno</p>
            <p className="text-xs text-muted-foreground">Elegí si queda terminada en clase o si requiere entrega con fecha límite.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.8fr_0.8fr]">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="h-10 rounded-md border border-input bg-card px-3 text-sm" placeholder="Título de la actividad" />
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="h-10 rounded-md border border-input bg-card px-3 text-sm">
            <option>Comunicación</option>
            <option>Matemática</option>
            <option>Ciencias Naturales</option>
            <option>Formación Cristiana</option>
          </select>
          <select value={modalidad} onChange={(e) => setModalidad(e.target.value as Tarea['modalidad'])} className="h-10 rounded-md border border-input bg-card px-3 text-sm">
            <option value="terminado_en_clase">Terminado en clase</option>
            <option value="tarea">Llevado como tarea</option>
          </select>
          <textarea value={consigna} onChange={(e) => setConsigna(e.target.value)} className="min-h-20 rounded-md border border-input bg-card px-3 py-2 text-sm lg:col-span-2" placeholder="Consigna" />
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">Fecha límite</label>
            <input
              type="date"
              value={venceAt}
              onChange={(e) => setVenceAt(e.target.value)}
              disabled={modalidad === 'terminado_en_clase'}
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm disabled:bg-muted/40 disabled:text-muted-foreground"
            />
            <button type="button" onClick={handleCreate} className="h-10 w-full rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste">
              Crear actividad
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {localTareas.map((tarea) => {
          const alumnos = alumnosForTask(tarea);
          const entregaByAlumno = Object.fromEntries(localEntregas.filter((e) => e.tareaId === tarea.id).map((e) => [e.alumnoId, e]));
          const counts = countStates(tarea, alumnos, entregaByAlumno);

          return (
            <article key={tarea.id} className="rounded-lg border border-border bg-background p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">{tarea.materia}</span>
                    <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {tarea.modalidad === 'terminado_en_clase' ? 'Terminado en clase' : `Tarea · vence ${formatDate(tarea.venceAt)}`}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-foreground">{tarea.titulo}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{tarea.consigna}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(counts).map(([estado, count]) =>
                  count > 0 ? <CountChip key={estado} label={ESTADO[estado as EstadoLectura].profesorLabel} count={count} style={ESTADO[estado as EstadoLectura].pill} /> : null
                )}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
                <div className="grid gap-0 divide-y divide-border">
                  {alumnos.map((alumno) => {
                    const entrega = entregaByAlumno[alumno.id];
                    const estado = resolveEstadoEntrega(tarea, entrega);
                    const cfg = ESTADO[estado];
                    const Icon = cfg.icon;
                    const key = draftKey(tarea.id, alumno.id);
                    const draft = correcciones[key] ?? { puntos: '9', nota: 'Buen trabajo. Revisar el orden de los pasos.' };

                    return (
                      <div key={`${tarea.id}-${alumno.id}`} className="grid gap-3 p-3 lg:grid-cols-[1fr_220px_360px] lg:items-start">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{alumno.nombre}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {entrega?.archivoEntregaUrl ? 'Imagen privada recibida' : 'Sin archivo de entrega'}
                          </p>
                          {estado === 'entregado_corregido' && entrega?.notaCorreccion ? (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">Nota: {entrega.notaCorreccion}</p>
                          ) : null}
                        </div>

                        <span className={cn('flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold', cfg.pill)}>
                          <Icon className="size-3.5" aria-hidden />
                          {cfg.profesorLabel}
                          {estado === 'entregado_corregido' && entrega?.puntos != null ? ` · ${entrega.puntos} pts` : ''}
                        </span>

                        {estado === 'entregado_en_revision' ? (
                          <div className="grid gap-2 sm:grid-cols-[90px_1fr_auto]">
                            <input
                              value={draft.puntos}
                              onChange={(e) => setCorrecciones((current) => ({ ...current, [key]: { ...draft, puntos: e.target.value } }))}
                              className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                              placeholder="Puntos"
                              inputMode="numeric"
                            />
                            <input
                              value={draft.nota}
                              onChange={(e) => setCorrecciones((current) => ({ ...current, [key]: { ...draft, nota: e.target.value } }))}
                              className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                              placeholder="Nota de corrección"
                            />
                            <button
                              type="button"
                              onClick={() => handleCorrect(tarea, alumno.id)}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-canaan-celeste"
                            >
                              <PencilLine className="size-3.5" aria-hidden />
                              Corregir
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {estado === 'pendiente' ? 'Esperando entrega antes del cierre.' : estado === 'no_entrego' ? 'El cierre pasó sin archivo.' : 'Sin acción pendiente.'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function resolveEstadoEntrega(tarea: Tarea, entrega?: Entrega): EstadoLectura {
  if (tarea.modalidad === 'terminado_en_clase') return 'terminado_en_clase';
  if (entrega?.estado === 'entregado_corregido') return 'entregado_corregido';
  if (entrega?.estado === 'entregado_en_revision') return 'entregado_en_revision';
  if (tarea.venceAt && demoToday > tarea.venceAt) return 'no_entrego';
  return 'pendiente';
}

function alumnosForTask(tarea: Tarea) {
  const gradeKey = Object.keys(demoAlumnosPorGrado).find((key) => key.startsWith(tarea.grado));
  return gradeKey ? demoAlumnosPorGrado[gradeKey] : [];
}

function countStates(tarea: Tarea, alumnos: Array<{ id: string; nombre: string }>, entregaByAlumno: Record<string, Entrega>) {
  return alumnos.reduce<Record<EstadoLectura, number>>(
    (acc, alumno) => {
      const estado = resolveEstadoEntrega(tarea, entregaByAlumno[alumno.id]);
      acc[estado] += 1;
      return acc;
    },
    { terminado_en_clase: 0, pendiente: 0, entregado_en_revision: 0, entregado_corregido: 0, no_entrego: 0 }
  );
}

function CountChip({ label, count, style }: { label: string; count: number; style: string }) {
  return <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-bold', style)}>{count} {label}</span>;
}

function draftKey(tareaId: string, alumnoId: string) {
  return `${tareaId}:${alumnoId}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'sin cierre';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' });
}
