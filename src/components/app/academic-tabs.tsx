'use client';

import { formatAcademicLabel } from '@/lib/academic-levels';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bell, BookOpen, ClipboardList, FileText, Info, Star, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Actividad, BoletinSemanal, NotaDiaria } from '@/lib/demo';

type Calificacion = {
  alumnoId: string;
  alumno: string;
  grado: string;
  materia: string;
  periodo: string;
  nota: string;
  observacion: string;
};

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'notas',          label: 'Notas diarias',  icon: BookOpen      },
  { id: 'calificaciones', label: 'Calificaciones', icon: ClipboardList  },
  { id: 'boletin',        label: 'Boletín',         icon: FileText       },
  { id: 'recordatorios',  label: 'Recordatorios',  icon: Bell           },
] as const;

type TabId = (typeof TABS)[number]['id'];
const REMINDER_STORAGE_KEY = 'canaan-recordatorios-vistos';

// ── Style maps ───────────────────────────────────────────────────────────────

const NOTA_TIPO = {
  info:        { label: 'Info',         Icon: Info,         style: 'bg-accent text-primary'                                      },
  felicitacion:{ label: 'Felicitación', Icon: Star,         style: 'border border-canaan-celeste/25 bg-canaan-celeste-suave text-primary' },
  observacion: { label: 'Observación',  Icon: AlertCircle,  style: 'bg-muted text-muted-foreground'                              },
} as const;

const ACT_TIPO = {
  tarea:   { label: 'Tarea',   style: 'bg-accent text-primary border-border',          dot: 'bg-canaan-celeste' },
  examen:  { label: 'Examen',  style: 'bg-canaan-celeste-suave text-primary border-border', dot: 'bg-canaan-celeste-claro' },
  evento:  { label: 'Evento',  style: 'bg-primary/10 text-primary border-primary/20',   dot: 'bg-primary'        },
  reunion: { label: 'Reunión', style: 'bg-accent text-primary border-border',           dot: 'bg-canaan-celeste' },
} as const;

// ── Date helpers ─────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fechaRelativa(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return 'Hoy';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yStr) return 'Ayer';

  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' });
}

function fechaLarga(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Main export ──────────────────────────────────────────────────────────────

export function AcademicTabs({
  calificaciones,
  notasDiarias,
  boletinSemanal,
  actividades,
}: {
  calificaciones: Calificacion[];
  notasDiarias: NotaDiaria[];
  boletinSemanal: BoletinSemanal[];
  actividades: Actividad[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>('notas');
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);
  const today = todayStr();
  const visibleActivities = useMemo(
    () => actividades.filter((actividad) => !dismissedReminderIds.includes(actividad.id)),
    [actividades, dismissedReminderIds]
  );
  const upcomingCount = visibleActivities.filter((a) => a.fecha >= today).length;

  useEffect(() => {
    const stored = window.localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setDismissedReminderIds(parsed.filter((id) => typeof id === 'string'));
      }
    } catch {
      window.localStorage.removeItem(REMINDER_STORAGE_KEY);
    }
  }, []);

  function dismissReminder(id: string) {
    setDismissedReminderIds((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      {/* Tab bar */}
      <div className="border-b border-border px-1 pt-1">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex min-h-12 min-w-0 flex-col items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-center text-sm font-semibold leading-tight transition-colors sm:flex-row sm:px-4',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="break-words">{tab.label}</span>
                {tab.id === 'recordatorios' && upcomingCount > 0 && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary">
                    {upcomingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-w-0 p-3 sm:p-5">
        {activeTab === 'notas'          && <NotasContent notas={notasDiarias} />}
        {activeTab === 'calificaciones' && <CalificacionesContent calificaciones={calificaciones} />}
        {activeTab === 'boletin'        && <BoletinContent boletines={boletinSemanal} />}
        {activeTab === 'recordatorios'  && <RecordatoriosContent actividades={visibleActivities} onDismiss={dismissReminder} />}
      </div>
    </div>
  );
}

// ── Notas diarias ────────────────────────────────────────────────────────────

function NotasContent({ notas }: { notas: NotaDiaria[] }) {
  const materias = useMemo(() => [...new Set(notas.map((n) => n.materia))].sort(), [notas]);
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? notas.filter((n) => n.materia === filter) : notas;

  if (notas.length === 0) return <Empty text="No hay notas diarias por ahora." />;

  return (
    <div className="space-y-4">
      {/* Materia filter chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={!filter} onClick={() => setFilter(null)}>Todas</Chip>
        {materias.map((m) => (
          <Chip key={m} active={filter === m} onClick={() => setFilter(filter === m ? null : m)}>
            {m}
          </Chip>
        ))}
      </div>

      {/* Notes feed */}
      <div className="space-y-3">
        {filtered.map((nota) => {
          const tipo = NOTA_TIPO[nota.tipo];
          const TipoIcon = tipo.Icon;
          return (
            <article key={nota.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
                  {nota.profesorInicial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{nota.profesor}</span>
                    <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {nota.materia}
                    </span>
                    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold', tipo.style)}>
                      <TipoIcon className="size-3" aria-hidden />
                      {tipo.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{fechaRelativa(nota.fecha)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground">{nota.texto}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ── Calificaciones ───────────────────────────────────────────────────────────

function CalificacionesContent({ calificaciones }: { calificaciones: Calificacion[] }) {
  if (calificaciones.length === 0) return <Empty text="No hay calificaciones registradas." />;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="block w-full text-sm sm:table">
        <thead className="sr-only bg-muted/40 sm:not-sr-only sm:table-header-group">
          <tr>
            {['Materia', 'Período', 'Nota', 'Observación'].map((col) => (
              <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block divide-y divide-border sm:table-row-group">
          {calificaciones.map((cal, i) => (
            <tr key={i} className="block p-3 transition-colors hover:bg-muted/30 sm:table-row sm:p-0">
              <td className="block py-1 font-semibold text-foreground before:mr-2 before:text-xs before:font-bold before:text-muted-foreground before:content-['Materia:'] sm:table-cell sm:px-4 sm:py-3 sm:before:content-none">{cal.materia}</td>
              <td className="block py-1 text-muted-foreground before:mr-2 before:text-xs before:font-bold before:content-['Período:'] sm:table-cell sm:px-4 sm:py-3 sm:before:content-none">{cal.periodo}</td>
              <td className="block py-1 before:mr-2 before:text-xs before:font-bold before:text-muted-foreground before:content-['Nota:'] sm:table-cell sm:px-4 sm:py-3 sm:before:content-none">
                <span
                  className={cn(
                    'inline-flex h-8 w-12 items-center justify-center rounded-md text-base font-bold',
                    Number(cal.nota) >= 4.5
                      ? 'bg-accent text-primary'
                      : Number(cal.nota) >= 4
                        ? 'bg-canaan-celeste-suave text-primary'
                        : 'bg-canaan-alerta-suave text-canaan-alerta'
                  )}
                >
                  {cal.nota}
                </span>
              </td>
              <td className="block break-words py-1 text-muted-foreground before:mr-2 before:text-xs before:font-bold before:content-['Observación:'] sm:table-cell sm:px-4 sm:py-3 sm:before:content-none">{cal.observacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Boletín semanal ──────────────────────────────────────────────────────────

function BoletinContent({ boletines }: { boletines: BoletinSemanal[] }) {
  if (boletines.length === 0) return <Empty text="No hay boletines disponibles." />;

  const current  = boletines.find((b) => b.esActual);
  const previous = boletines.filter((b) => !b.esActual);

  return (
    <div className="space-y-4">
      {/* Current week — highlighted */}
      {current && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary">Semana actual</span>
              <h3 className="mt-1 text-base font-bold text-foreground">{current.titulo}</h3>
            </div>
            <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
              En curso
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground">{current.resumen}</p>
          {current.hitos.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {current.hitos.map((hito, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {hito}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">Por {current.autor}</p>
        </div>
      )}

      {/* Previous weeks */}
      {previous.map((boletin) => (
        <div key={boletin.id} className="rounded-lg border border-border bg-background p-4">
          <h4 className="text-sm font-semibold text-foreground">{boletin.titulo}</h4>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{formatAcademicLabel(boletin.resumen)}</p>
          {boletin.hitos.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {boletin.hitos.map((hito, i) => (
                <span key={i} className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground">
                  {hito}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Recordatorios ────────────────────────────────────────────────────────────

function RecordatoriosContent({ actividades, onDismiss }: { actividades: Actividad[]; onDismiss: (id: string) => void }) {
  const today = todayStr();
  const sorted = [...actividades].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const hoy      = sorted.filter((a) => a.fecha === today);
  const proximos = sorted.filter((a) => a.fecha > today);
  const pasados  = sorted.filter((a) => a.fecha < today).reverse().slice(0, 3);

  if (actividades.length === 0) return <Empty text="No hay recordatorios activos." />;

  return (
    <div className="space-y-6">
      {hoy.length > 0      && <RecordatorioGroup title="Hoy"      items={hoy}      onDismiss={onDismiss} />}
      {proximos.length > 0 && <RecordatorioGroup title="Próximos" items={proximos} onDismiss={onDismiss} />}
      {pasados.length > 0  && <RecordatorioGroup title="Pasados"  items={pasados}  onDismiss={onDismiss} muted />}
    </div>
  );
}

function RecordatorioGroup({
  title,
  items,
  onDismiss,
  muted = false
}: {
  title: string;
  items: Actividad[];
  onDismiss: (id: string) => void;
  muted?: boolean;
}) {
  return (
    <div>
      <h3 className={cn('mb-3 text-xs font-bold uppercase tracking-wide', muted ? 'text-muted-foreground/60' : 'text-muted-foreground')}>
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((act) => {
          const tipo = ACT_TIPO[act.tipo];
          return (
            <div
              key={act.id}
              role="button"
              tabIndex={0}
              onClick={() => onDismiss(act.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onDismiss(act.id);
                }
              }}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/45',
                muted ? 'border-border/50 bg-muted/20 opacity-60' : 'border-border bg-background'
              )}
            >
              <span className={cn('size-2 shrink-0 rounded-full', tipo.dot)} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{act.titulo}</span>
                  {act.materia && <span className="text-[11px] text-muted-foreground">{act.materia}</span>}
                </div>
                {act.descripcion && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{act.descripcion}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className={cn('inline-block rounded border px-2 py-0.5 text-[11px] font-semibold', tipo.style)}>
                  {tipo.label}
                </span>
                <p className="mt-1 text-[11px] capitalize text-muted-foreground">{fechaLarga(act.fecha)}</p>
                {act.hora && <p className="text-[11px] text-muted-foreground">{act.hora} hs</p>}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDismiss(act.id);
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Eliminar recordatorio ${act.titulo}`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
