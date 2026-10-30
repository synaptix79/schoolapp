'use client';
import { formatAcademicLabel } from '@/lib/academic-levels';


import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  BarChart2,
  PenLine,
  Newspaper,
  BookOpen,
  Plus,
  X,
  CheckCircle2,
  Clock,
  Trash2,
  Sparkles,
  Send,
  Save,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  demoAnotaciones,
  demoCalificaciones,
  demoAlumnosPorGrado,
  demoDocentePerfil,
  type AnotacionDocente,
} from '@/lib/demo';

// ── Constants ─────────────────────────────────────────────────────────────────

type Tab = 'calificaciones' | 'anotaciones' | 'boletin-diario' | 'boletin-semanal';

const TABS: { id: Tab; label: string; icon: typeof BarChart2 }[] = [
  { id: 'calificaciones',  label: 'Calificaciones',  icon: BarChart2  },
  { id: 'anotaciones',     label: 'Anotaciones',     icon: PenLine    },
  { id: 'boletin-diario',  label: 'Boletín diario',  icon: Newspaper  },
  { id: 'boletin-semanal', label: 'Boletín semanal', icon: BookOpen   },
];
const TAB_BY_ID = Object.fromEntries(TABS.map((tab) => [tab.id, tab])) as Record<Tab, (typeof TABS)[number]>;

const GRADOS    = demoDocentePerfil.grados;
const MATERIAS  = ['Comunicación', 'Matemática', 'Ciencias Naturales', 'Formación Cristiana'];
const PERIODOS  = ['1er trimestre', '2.º trimestre', '3er trimestre'];
const TODAY     = '2026-06-26';
const TODAY_FMT = '26 de junio de 2026';
const WEEK_FMT  = '23–28 de junio, 2026';

const TIPO_CFG = {
  info:         { label: 'Información',  pill: 'bg-accent text-primary border-border'               },
  felicitacion: { label: 'Felicitación', pill: 'bg-canaan-celeste-suave text-primary border-border' },
  observacion:  { label: 'Observación',  pill: 'bg-canaan-alerta-suave text-canaan-alerta border-canaan-alerta/30' },
} as const;

// ── Auto-generate helpers ─────────────────────────────────────────────────────

function buildBoletinDiario(grado: string, anots: AnotacionDocente[]): string {
  const hoy = anots.filter((a) => a.grado === grado && a.fecha === TODAY && a.estado === 'completada');
  if (!hoy.length) {
    return `Hoy en ${formatAcademicLabel(grado)} (${TODAY_FMT}):\n\nJornada de trabajo académico. Los alumnos participaron activamente.\n\n— ${demoDocentePerfil.nombre}`;
  }
  let text = `Hoy en ${formatAcademicLabel(grado)} (${TODAY_FMT}):\n\n`;
  for (const a of hoy) {
    const quien = a.alumnoNombre ? `(${a.alumnoNombre}) ` : '';
    text += `${a.materia}: ${quien}${a.texto}\n\n`;
  }
  return text.trimEnd() + `\n\n— ${demoDocentePerfil.nombre}`;
}

function buildBoletinSemanal(grado: string, anots: AnotacionDocente[]): string {
  const completadas = anots.filter((a) => a.grado === grado && a.estado === 'completada');
  if (!completadas.length) {
    return `Esta semana en ${formatAcademicLabel(grado)} (${WEEK_FMT}):\n\nSemana de trabajo académico. Los alumnos mostraron buen desempeño general. Próxima semana continuamos con el programa.\n\n¡Buen fin de semana! — ${demoDocentePerfil.nombre}`;
  }
  const byMateria: Record<string, string[]> = {};
  for (const a of completadas) {
    if (!byMateria[a.materia]) byMateria[a.materia] = [];
    byMateria[a.materia].push(a.alumnoNombre ? `(${a.alumnoNombre}) ${a.texto}` : a.texto);
  }
  let text = `Esta semana en ${formatAcademicLabel(grado)} (${WEEK_FMT}):\n\n`;
  for (const [materia, textos] of Object.entries(byMateria)) {
    text += `${materia}: ${textos.join(' ')}.\n\n`;
  }
  return text.trimEnd() + `\n\n¡Buen fin de semana! — ${demoDocentePerfil.nombre}`;
}

// ── Boletín state type ────────────────────────────────────────────────────────

type BoletinState = {
  contenido: string;
  estado: 'idle' | 'borrador' | 'publicado';
  origen: 'auto' | 'manual' | null;
};

function emptyBoletin(): BoletinState {
  return { contenido: '', estado: 'idle', origen: null };
}

// ── Main component ────────────────────────────────────────────────────────────

export function CargaDocenteTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('calificaciones');
  const [tabOrder, setTabOrder] = useState<Tab[]>(() => TABS.map((tab) => tab.id));
  const tabDragRef = useRef<{ tab: Tab; pointerId: number; startX: number; startY: number; dragging: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  // Shared grade selector (persists across tabs)
  const [selectedGrado, setSelectedGrado] = useState(GRADOS[0]);

  // ── Calificaciones state ──
  const [calMateria, setCalMateria] = useState(MATERIAS[0]);
  const [calPeriodo, setCalPeriodo] = useState(PERIODOS[0]);

  // ── Anotaciones state ──
  const [anotaciones, setAnotaciones] = useState<AnotacionDocente[]>(demoAnotaciones);
  const [showForm, setShowForm]        = useState(false);
  const [fAlumnoId, setFAlumnoId]     = useState<string | null>(null);
  const [fAlumnoNombre, setFAlumnoNombre] = useState<string | null>(null);
  const [fMateria, setFMateria]       = useState(MATERIAS[0]);
  const [fTipo, setFTipo]             = useState<AnotacionDocente['tipo']>('info');
  const [fTexto, setFTexto]           = useState('');

  // ── Boletín diario state (one per grade) ──
  const [boletinDiario, setBoletinDiario] = useState<Record<string, BoletinState>>(
    Object.fromEntries(GRADOS.map((g) => [g, emptyBoletin()]))
  );

  // ── Boletín semanal state (one per grade) ──
  const [boletinSemanal, setBoletinSemanal] = useState<Record<string, BoletinState>>(
    Object.fromEntries(GRADOS.map((g) => [g, emptyBoletin()]))
  );

  // ── Derived values ────────────────────────────────────────────────────────
  const alumnosPorGrado = demoAlumnosPorGrado[selectedGrado] ?? [];
  const gradoAnnots = anotaciones.filter((a) => a.grado === selectedGrado);
  const borradores  = gradoAnnots.filter((a) => a.estado === 'borrador');
  const completadas = gradoAnnots.filter((a) => a.estado === 'completada');

  // Calificaciones table rows
  const calRows = alumnosPorGrado.map((a) => {
    const existing = demoCalificaciones.find(
      (c) => c.alumnoId === a.id && c.materia === calMateria
    );
    return { ...a, nota: existing?.nota ?? '', observacion: existing?.observacion ?? '' };
  });

  const bdGrado = boletinDiario[selectedGrado]  ?? emptyBoletin();
  const bsGrado = boletinSemanal[selectedGrado] ?? emptyBoletin();
  const orderedTabs = tabOrder.map((tabId) => TAB_BY_ID[tabId]);

  function moveDraggedTab(targetTab: Tab) {
    const drag = tabDragRef.current;
    if (!drag || drag.tab === targetTab) return;

    setTabOrder((current) => {
      const from = current.indexOf(drag.tab);
      const to = current.indexOf(targetTab);
      if (from < 0 || to < 0 || from === to) return current;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleTabPointerDown(event: ReactPointerEvent<HTMLButtonElement>, tab: Tab) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    tabDragRef.current = {
      tab,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleTabPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = tabDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.dragging && moved < 8) return;
    drag.dragging = true;

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLButtonElement>('[data-tab-id]')
      ?.dataset.tabId as Tab | undefined;

    if (target) moveDraggedTab(target);
  }

  function handleTabPointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = tabDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    suppressClickRef.current = drag.dragging;
    tabDragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleTabClick(tab: Tab) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setActiveTab(tab);
  }

  // ── Annotation actions ────────────────────────────────────────────────────
  function handleCompletar(id: string) {
    setAnotaciones((prev) => prev.map((a) => (a.id === id ? { ...a, estado: 'completada' } : a)));
  }

  function handleEliminar(id: string) {
    setAnotaciones((prev) => prev.filter((a) => a.id !== id));
  }

  function handleCompletarTodas() {
    setAnotaciones((prev) =>
      prev.map((a) =>
        a.grado === selectedGrado && a.estado === 'borrador' ? { ...a, estado: 'completada' } : a
      )
    );
  }

  function handleGuardarAnot() {
    if (!fTexto.trim()) return;
    const nueva: AnotacionDocente = {
      id: `anot-${Date.now()}`,
      grado: selectedGrado,
      alumnoId: fAlumnoId,
      alumnoNombre: fAlumnoNombre,
      materia: fMateria,
      profesor: demoDocentePerfil.nombre,
      texto: fTexto.trim(),
      tipo: fTipo,
      estado: 'borrador',
      fecha: TODAY,
    };
    setAnotaciones((prev) => [nueva, ...prev]);
    setShowForm(false);
    setFTexto('');
    setFAlumnoId(null);
    setFAlumnoNombre(null);
    setFMateria(MATERIAS[0]);
    setFTipo('info');
  }

  // ── Boletín diario actions ────────────────────────────────────────────────
  function patchBD(patch: Partial<BoletinState>) {
    setBoletinDiario((prev) => ({
      ...prev,
      [selectedGrado]: { ...prev[selectedGrado], ...patch },
    }));
  }

  // ── Boletín semanal actions ───────────────────────────────────────────────
  function patchBS(patch: Partial<BoletinState>) {
    setBoletinSemanal((prev) => ({
      ...prev,
      [selectedGrado]: { ...prev[selectedGrado], ...patch },
    }));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg border border-border bg-card shadow-soft">

      {/* ── Header: tab bar + grade selector ── */}
      <div className="flex flex-col gap-0 sm:flex-row sm:items-center sm:justify-between border-b border-border">
        {/* Tabs */}
        <div className="flex overflow-x-auto">
          {orderedTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              data-tab-id={id}
              onClick={() => handleTabClick(id)}
              onPointerDown={(event) => handleTabPointerDown(event, id)}
              onPointerMove={handleTabPointerMove}
              onPointerUp={handleTabPointerEnd}
              onPointerCancel={handleTabPointerEnd}
              style={{ touchAction: 'none' }}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors',
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/* Grade selector */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-2 sm:border-t-0">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Grado
          </label>
          <select
            value={selectedGrado}
            onChange={(e) => setSelectedGrado(e.target.value)}
            className="h-8 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground"
          >
            {GRADOS.map((g) => <option key={g} value={g}>{formatAcademicLabel(g)}</option>)}
          </select>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="p-5">

        {/* ════════════════════════════════════════ Tab 1: Calificaciones */}
        {activeTab === 'calificaciones' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Materia
                </label>
                <select
                  value={calMateria}
                  onChange={(e) => setCalMateria(e.target.value)}
                  className="h-10 rounded-md border border-input bg-card px-3 text-sm"
                >
                  {MATERIAS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Período
                </label>
                <select
                  value={calPeriodo}
                  onChange={(e) => setCalPeriodo(e.target.value)}
                  className="h-10 rounded-md border border-input bg-card px-3 text-sm"
                >
                  {PERIODOS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste"
              >
                <Save className="size-4" aria-hidden />
                Guardar demo
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    {['Alumno', 'Nota', 'Observación'].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {calRows.length > 0 ? (
                    calRows.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{row.nombre}</td>
                        <td className="px-4 py-3">
                          <input
                            className="h-9 w-20 rounded-md border border-input bg-card px-2 text-sm"
                            defaultValue={row.nota}
                            placeholder="—"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="h-9 w-full min-w-[200px] rounded-md border border-input bg-card px-2 text-sm"
                            defaultValue={row.observacion}
                            placeholder="Observación opcional…"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Sin alumnos cargados para este grado en el demo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ Tab 2: Anotaciones */}
        {activeTab === 'anotaciones' && (
          <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Anotaciones del día — {TODAY_FMT}
                </p>
                <p className="text-xs text-muted-foreground">
                  {borradores.length} borrador{borradores.length !== 1 ? 'es' : ''} ·{' '}
                  {completadas.length} completada{completadas.length !== 1 ? 's' : ''}
                </p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-canaan-celeste"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Nueva anotación
                </button>
              )}
            </div>

            {/* Inline form */}
            {showForm && (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Nueva anotación</p>
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Alumno */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Alumno
                    </label>
                    <select
                      value={fAlumnoId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setFAlumnoId(null);
                          setFAlumnoNombre(null);
                        } else {
                          const a = alumnosPorGrado.find((x) => x.id === val);
                          setFAlumnoId(val);
                          setFAlumnoNombre(a?.nombre ?? null);
                        }
                      }}
                      className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                    >
                      <option value="">Todo el grado</option>
                      {alumnosPorGrado.map((a) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Materia */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Materia
                    </label>
                    <select
                      value={fMateria}
                      onChange={(e) => setFMateria(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                    >
                      {MATERIAS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Tipo */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tipo
                    </label>
                    <select
                      value={fTipo}
                      onChange={(e) => setFTipo(e.target.value as AnotacionDocente['tipo'])}
                      className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                    >
                      <option value="info">Información</option>
                      <option value="felicitacion">Felicitación</option>
                      <option value="observacion">Observación</option>
                    </select>
                  </div>
                </div>

                {/* Texto */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Texto
                  </label>
                  <textarea
                    value={fTexto}
                    onChange={(e) => setFTexto(e.target.value)}
                    rows={3}
                    placeholder="Escribí la anotación del día…"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleGuardarAnot}
                    disabled={!fTexto.trim()}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-canaan-celeste disabled:opacity-40"
                  >
                    <Save className="size-3.5" aria-hidden />
                    Guardar borrador
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Borradores */}
            {borradores.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-canaan-alerta">
                    Borrador ({borradores.length})
                  </p>
                  <button
                    onClick={handleCompletarTodas}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Completar todas
                  </button>
                </div>
                {borradores.map((a) => (
                  <AnotacionCard
                    key={a.id}
                    anot={a}
                    onCompletar={() => handleCompletar(a.id)}
                    onEliminar={() => handleEliminar(a.id)}
                  />
                ))}
              </div>
            )}

            {/* Completadas */}
            {completadas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Completadas ({completadas.length})
                </p>
                {completadas.map((a) => (
                  <AnotacionCard key={a.id} anot={a} />
                ))}
              </div>
            )}

            {gradoAnnots.length === 0 && !showForm && (
              <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                No hay anotaciones para {formatAcademicLabel(selectedGrado)} hoy.
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════ Tab 3: Boletín diario */}
        {activeTab === 'boletin-diario' && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Boletín diario — {TODAY_FMT}</p>
              <p className="text-xs text-muted-foreground">
                Resumen del día para alumnos de {formatAcademicLabel(selectedGrado)}.
              </p>
            </div>

            {bdGrado.estado === 'idle' && (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-10">
                <p className="text-sm text-muted-foreground">Sin boletín para hoy.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => patchBD({ estado: 'borrador', origen: 'auto', contenido: buildBoletinDiario(selectedGrado, anotaciones) })}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-canaan-celeste"
                  >
                    <Sparkles className="size-4" aria-hidden />
                    Generar desde anotaciones
                  </button>
                  <button
                    onClick={() => patchBD({ estado: 'borrador', origen: 'manual', contenido: '' })}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <PenLine className="size-4" aria-hidden />
                    Redactar manualmente
                  </button>
                </div>
              </div>
            )}

            {bdGrado.estado === 'borrador' && (
              <div className="space-y-4">
                {bdGrado.origen === 'auto' && (
                  <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                    <Sparkles className="size-3.5 shrink-0" aria-hidden />
                    Borrador generado automáticamente desde las anotaciones completadas. Podés editarlo antes de publicar.
                  </div>
                )}
                <textarea
                  value={bdGrado.contenido}
                  onChange={(e) => patchBD({ contenido: e.target.value })}
                  rows={8}
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Escribí el resumen del día…"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => patchBD({ estado: 'publicado' })}
                    disabled={!bdGrado.contenido.trim()}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-canaan-celeste disabled:opacity-40"
                  >
                    <Send className="size-4" aria-hidden />
                    Publicar boletín
                  </button>
                  <button
                    onClick={() => patchBD(emptyBoletin())}
                    className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {bdGrado.estado === 'publicado' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                  Boletín publicado — visible para alumnos de {formatAcademicLabel(selectedGrado)}.
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {bdGrado.contenido}
                </div>
                <button
                  onClick={() => patchBD(emptyBoletin())}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  Reemplazar boletín
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════ Tab 4: Boletín semanal */}
        {activeTab === 'boletin-semanal' && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Boletín semanal — {WEEK_FMT}</p>
              <p className="text-xs text-muted-foreground">
                Resumen de la semana para alumnos de {formatAcademicLabel(selectedGrado)}.
              </p>
            </div>

            {bsGrado.estado === 'idle' && (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-10">
                <p className="text-sm text-muted-foreground">Sin boletín para esta semana.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => patchBS({ estado: 'borrador', origen: 'auto', contenido: buildBoletinSemanal(selectedGrado, anotaciones) })}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-canaan-celeste"
                  >
                    <Sparkles className="size-4" aria-hidden />
                    Generar automático
                  </button>
                  <button
                    onClick={() => patchBS({ estado: 'borrador', origen: 'manual', contenido: '' })}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <PenLine className="size-4" aria-hidden />
                    Redactar manualmente
                  </button>
                </div>
              </div>
            )}

            {bsGrado.estado === 'borrador' && (
              <div className="space-y-4">
                {bsGrado.origen === 'auto' && (
                  <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                    <Sparkles className="size-3.5 shrink-0" aria-hidden />
                    Compilado automáticamente desde las anotaciones completadas de la semana. Editá el texto antes de publicar.
                  </div>
                )}
                <textarea
                  value={bsGrado.contenido}
                  onChange={(e) => patchBS({ contenido: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Escribí el resumen de la semana…"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => patchBS({ estado: 'publicado' })}
                    disabled={!bsGrado.contenido.trim()}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-canaan-celeste disabled:opacity-40"
                  >
                    <Send className="size-4" aria-hidden />
                    Publicar boletín semanal
                  </button>
                  <button
                    onClick={() => patchBS(emptyBoletin())}
                    className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {bsGrado.estado === 'publicado' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                  Boletín semanal publicado — visible para alumnos de {formatAcademicLabel(selectedGrado)}.
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {bsGrado.contenido}
                </div>
                <button
                  onClick={() => patchBS(emptyBoletin())}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  Reemplazar boletín
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── AnotacionCard ─────────────────────────────────────────────────────────────

function AnotacionCard({
  anot,
  onCompletar,
  onEliminar,
}: {
  anot: AnotacionDocente;
  onCompletar?: () => void;
  onEliminar?: () => void;
}) {
  const tipoCfg = TIPO_CFG[anot.tipo];
  const isBorrador = anot.estado === 'borrador';

  return (
    <div className={cn('rounded-lg border p-4', isBorrador ? 'border-border bg-background' : 'border-border bg-muted/20')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
              {anot.materia}
            </span>
            {anot.alumnoNombre && (
              <span className="text-[11px] text-muted-foreground">{anot.alumnoNombre}</span>
            )}
            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', tipoCfg.pill)}>
              {tipoCfg.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{anot.texto}</p>
        </div>

        {/* Right: state + actions */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {isBorrador ? (
            <div className="flex items-center gap-1.5 text-xs text-canaan-alerta">
              <Clock className="size-3.5" />
              Borrador
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="size-3.5" />
              Completada
            </div>
          )}

          {isBorrador && (
            <div className="flex gap-1.5">
              {onCompletar && (
                <button
                  onClick={onCompletar}
                  className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground hover:bg-canaan-celeste"
                >
                  Completar
                </button>
              )}
              {onEliminar && (
                <button
                  onClick={onEliminar}
                  className="rounded-md border border-border bg-card p-1 text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
