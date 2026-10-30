'use client';
import { formatAcademicLabel } from '@/lib/academic-levels';


import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { demoToday } from '@/lib/demo';
import type { Actividad, ConfigCalendario } from '@/lib/demo';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fromStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon = 0
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getWeekDays(anchor: Date): Date[] {
  const offset = (anchor.getDay() + 6) % 7; // Mon = 0
  const mon = new Date(anchor);
  mon.setDate(anchor.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function fechaLarga(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Style map ────────────────────────────────────────────────────────────────

const TIPO = {
  tarea:   { label: 'Tarea',   pill: 'bg-canaan-celeste-suave text-primary border-border',          dot: 'bg-canaan-celeste' },
  examen:  { label: 'Examen',  pill: 'bg-canaan-celeste-suave text-primary border-border',           dot: 'bg-canaan-celeste-claro' },
  evento:  { label: 'Evento',  pill: 'bg-primary/10 text-primary border-primary/20',                 dot: 'bg-primary'        },
  reunion: { label: 'Reunión', pill: 'bg-accent text-primary border-border',                         dot: 'bg-canaan-celeste' },
} as const;

const TIPO_PRIORITY: Record<Actividad['tipo'], number> = { examen: 0, reunion: 1, evento: 2, tarea: 3 };

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const BUSINESS_DAYS = new Set([1, 2, 3, 4, 5]);
const MATERIAS = ['Matemática', 'Comunicación', 'Ciencias Naturales', 'Biblia', 'General'];

type CalendarioViewProps = {
  actividades: Actividad[];
  config?: ConfigCalendario[];
  canCreate?: boolean;
  createGrades?: string[];
  defaultGrado?: string | null;
};

type CreateActivityForm = {
  tipo: Actividad['tipo'];
  titulo: string;
  fecha: string;
  hora: string;
  materia: string;
  descripcion: string;
  grado: string;
};

// ── Main component ────────────────────────────────────────────────────────────

export function CalendarioView({
  actividades,
  config = [],
  canCreate = false,
  createGrades = [],
  defaultGrado = null,
}: CalendarioViewProps) {
  const todayStr = demoToday;
  const today = fromStr(todayStr);
  const initialCreateDate = toStr(isBusinessDay(today) ? today : nextBusinessDay(today));
  const gradeOptions = createGrades.length > 0 ? createGrades : defaultGrado ? [defaultGrado] : [];

  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay]   = useState<string | null>(() => (isBusinessDay(today) ? todayStr : null));
  const [viewMode, setViewMode]         = useState<'month' | 'week'>('month');
  const [selectedAct, setSelectedAct]   = useState<Actividad | null>(null);
  const [localActivities, setLocalActivities] = useState<Actividad[]>(() => actividades);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateActivityForm>(() => ({
    tipo: 'tarea',
    titulo: '',
    fecha: initialCreateDate,
    hora: '',
    materia: MATERIAS[0],
    descripcion: '',
    grado: defaultGrado ?? gradeOptions[0] ?? '',
  }));

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 42-cell month grid
  const calDays = useMemo(() => getCalendarDays(year, month), [year, month]);
  const calWeeks = useMemo(() => chunkWeeks(calDays), [calDays]);

  // Week containing selected day (or today)
  const weekDays = useMemo(() => getWeekDays(selectedDay ? fromStr(selectedDay) : fromStr(todayStr)), [selectedDay, todayStr]);

  // Activity index by date string
  const actByDate = useMemo(() => {
    const map: Record<string, Actividad[]> = {};
    for (const act of localActivities) {
      (map[act.fecha] ??= []).push(act);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => TIPO_PRIORITY[a.tipo] - TIPO_PRIORITY[b.tipo]);
    }
    return map;
  }, [localActivities]);

  const monthShowsWeekends = useMemo(
    () => hasWeekendExceptionInMonth(year, month, actByDate, config),
    [year, month, actByDate, config]
  );

  const weekShowsWeekends = useMemo(
    () => weekDays.some((day) => !isBusinessDay(day) && shouldRevealWeekend(toStr(day), actByDate, config)),
    [weekDays, actByDate, config]
  );

  const selectedActs = selectedDay ? (actByDate[selectedDay] ?? []) : [];

  // Period navigation
  function prevPeriod() {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(year, month - 1, 1));
    } else {
      const anchor = selectedDay ? fromStr(selectedDay) : today;
      const newAnchor = new Date(anchor);
      newAnchor.setDate(anchor.getDate() - 7);
      const newStr = toStr(newAnchor);
      setSelectedDay(newStr);
      setCurrentMonth(new Date(newAnchor.getFullYear(), newAnchor.getMonth(), 1));
    }
  }

  function nextPeriod() {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(year, month + 1, 1));
    } else {
      const anchor = selectedDay ? fromStr(selectedDay) : today;
      const newAnchor = new Date(anchor);
      newAnchor.setDate(anchor.getDate() + 7);
      const newStr = toStr(newAnchor);
      setSelectedDay(newStr);
      setCurrentMonth(new Date(newAnchor.getFullYear(), newAnchor.getMonth(), 1));
    }
  }

  function goToToday() {
    const now = fromStr(todayStr);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    const nowStr = toStr(now);
    setSelectedDay(isBusinessDay(now) || shouldRevealWeekend(nowStr, actByDate, config) ? nowStr : null);
  }

  function toggleCreateForm() {
    if (!showCreateForm) {
      const selectedDate = selectedDay ? fromStr(selectedDay) : null;
      setCreateForm((current) => ({
        ...current,
        tipo: 'tarea',
        titulo: '',
        hora: '',
        materia: MATERIAS[0],
        descripcion: '',
        fecha: selectedDate && isBusinessDay(selectedDate) ? selectedDay! : current.fecha || initialCreateDate,
        grado: current.grado || defaultGrado || gradeOptions[0] || '',
      }));
      setEditingActivityId(null);
      setFormError(null);
    }
    setShowCreateForm((isOpen) => !isOpen);
  }

  function updateCreateForm<K extends keyof CreateActivityForm>(key: K, value: CreateActivityForm[K]) {
    setCreateForm((current) => ({ ...current, [key]: value }));
    if (formError) setFormError(null);
  }

  function openActivityForm(dateStr: string, activity?: Actividad) {
    const targetDate = activity?.fecha ?? dateStr;
    const activityDate = fromStr(targetDate);

    if (!isBusinessDay(activityDate)) {
      setShowCreateForm(true);
      setFormError('El calendario académico usa días laborales. Elegí una fecha de lunes a viernes.');
      return;
    }

    setCreateForm({
      tipo: activity?.tipo ?? 'tarea',
      titulo: activity?.titulo ?? '',
      fecha: targetDate,
      hora: activity?.hora ?? '',
      materia: activity?.materia ?? MATERIAS[0],
      descripcion: activity?.descripcion ?? '',
      grado: activity?.grado ?? defaultGrado ?? gradeOptions[0] ?? '',
    });
    setEditingActivityId(activity?.id ?? null);
    setSelectedDay(targetDate);
    setSelectedAct(null);
    setCurrentMonth(new Date(activityDate.getFullYear(), activityDate.getMonth(), 1));
    setFormError(null);
    setShowCreateForm(true);
  }

  function closeActivityForm() {
    setShowCreateForm(false);
    setEditingActivityId(null);
    setFormError(null);
  }

  function handleSelectDay(dayStr: string) {
    const acts = actByDate[dayStr] ?? [];
    setSelectedDay(selectedDay === dayStr ? null : dayStr);

    if (!canCreate && acts.length > 0 && isCoarsePointer()) {
      setSelectedAct(acts[0]);
    }
  }

  function handleDayDoubleClick(dayStr: string) {
    const acts = actByDate[dayStr] ?? [];
    setSelectedDay(dayStr);

    if (canCreate) {
      openActivityForm(dayStr, acts[0]);
      return;
    }

    if (acts[0]) {
      setSelectedAct(acts[0]);
    }
  }

  function handleActivityClick(activity: Actividad) {
    setSelectedDay(activity.fecha);
    setSelectedAct(activity);
  }

  function handleActivityDoubleClick(activity: Actividad) {
    if (canCreate) {
      openActivityForm(activity.fecha, activity);
      return;
    }

    setSelectedDay(activity.fecha);
    setSelectedAct(activity);
  }

  function handleSaveActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = createForm.titulo.trim();
    if (!title) {
      setFormError('Ingresá un título para la actividad.');
      return;
    }

    if (!createForm.fecha) {
      setFormError('Elegí una fecha de lunes a viernes.');
      return;
    }

    const activityDate = fromStr(createForm.fecha);
    if (!isBusinessDay(activityDate)) {
      setFormError('El calendario académico usa días laborales. Elegí una fecha de lunes a viernes.');
      return;
    }

    const actividadGuardada: Actividad = {
      id: editingActivityId ?? `actividad-docente-${Date.now()}`,
      tipo: createForm.tipo,
      titulo: title,
      descripcion: createForm.descripcion.trim() || 'Actividad cargada por el docente.',
      materia: createForm.materia === 'General' ? null : createForm.materia,
      grado: createForm.grado || defaultGrado,
      fecha: createForm.fecha,
      hora: createForm.hora || null,
    };

    setLocalActivities((current) => {
      if (!editingActivityId) return [...current, actividadGuardada];
      return current.map((activity) => (activity.id === editingActivityId ? actividadGuardada : activity));
    });
    setSelectedDay(createForm.fecha);
    setCurrentMonth(new Date(activityDate.getFullYear(), activityDate.getMonth(), 1));
    setShowCreateForm(false);
    setEditingActivityId(null);
    setFormError(null);
    setCreateForm((current) => ({
      ...current,
      titulo: '',
      descripcion: '',
      hora: '',
      fecha: createForm.fecha,
    }));
  }

  // Header label
  const periodLabel =
    viewMode === 'month'
      ? currentMonth.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })
      : (() => {
          const first = weekDays[0];
          const last  = weekDays[6];
          return first.getMonth() === last.getMonth()
            ? `${first.getDate()}–${last.getDate()} de ${last.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' })}`
            : `${first.getDate()} ${first.toLocaleDateString('es-PY', { month: 'short' })} – ${last.getDate()} ${last.toLocaleDateString('es-PY', { month: 'short', year: 'numeric' })}`;
        })();

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NavBtn onClick={prevPeriod} aria-label="Período anterior"><ChevronLeft className="size-4" aria-hidden /></NavBtn>
          <h2 className="min-w-[200px] text-center text-base font-bold capitalize text-foreground">{periodLabel}</h2>
          <NavBtn onClick={nextPeriod} aria-label="Período siguiente"><ChevronRight className="size-4" aria-hidden /></NavBtn>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden items-center rounded-md bg-accent px-3 text-xs font-semibold text-primary lg:inline-flex">
            {viewMode === 'month' && monthShowsWeekends ? 'Mes completo por fin de semana' : 'Semana laboral · sin fines de semana'}
          </span>
          {canCreate && (
            <button
              type="button"
              onClick={toggleCreateForm}
              className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-canaan-celeste"
            >
              <Plus className="size-3.5" aria-hidden />
              Crear actividad/tarea
            </button>
          )}
          <button
            onClick={goToToday}
            className="h-8 rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Hoy
          </button>
          <div className="flex overflow-hidden rounded-md border border-border">
            <ToggleBtn active={viewMode === 'month'} onClick={() => setViewMode('month')}>Mes</ToggleBtn>
            <ToggleBtn active={viewMode === 'week'}  onClick={() => setViewMode('week')}  border>Semana</ToggleBtn>
          </div>
        </div>
      </div>

      {canCreate && showCreateForm && (
        <form onSubmit={handleSaveActivity} className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">
              {editingActivityId ? 'Editar actividad' : 'Nueva actividad'}
            </h3>
            <button
              type="button"
              onClick={closeActivityForm}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar formulario"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_150px_150px_130px]">
            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Título
              <input
                value={createForm.titulo}
                onChange={(event) => updateCreateForm('titulo', event.target.value)}
                placeholder="Ej. Guía de fracciones"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Tipo
              <select
                value={createForm.tipo}
                onChange={(event) => updateCreateForm('tipo', event.target.value as Actividad['tipo'])}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="tarea">Tarea</option>
                <option value="examen">Examen</option>
                <option value="evento">Evento</option>
                <option value="reunion">Reunión</option>
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Fecha
              <input
                type="date"
                value={createForm.fecha}
                onChange={(event) => updateCreateForm('fecha', event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Hora
              <input
                type="time"
                value={createForm.hora}
                onChange={(event) => updateCreateForm('hora', event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[180px_180px_minmax(0,1fr)]">
            {gradeOptions.length > 0 && (
              <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                Grado
                <select
                  value={createForm.grado}
                  onChange={(event) => updateCreateForm('grado', event.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {gradeOptions.map((grado) => (
                    <option key={grado} value={grado}>{formatAcademicLabel(grado)}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Materia
              <select
                value={createForm.materia}
                onChange={(event) => updateCreateForm('materia', event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {MATERIAS.map((materia) => (
                  <option key={materia} value={materia}>{materia}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold text-muted-foreground">
              Descripción
              <input
                value={createForm.descripcion}
                onChange={(event) => updateCreateForm('descripcion', event.target.value)}
                placeholder="Detalle breve para el calendario"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {formError ? (
              <p className="rounded-md bg-canaan-alerta-suave px-3 py-2 text-xs font-semibold text-canaan-alerta">{formError}</p>
            ) : (
              <span aria-hidden />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeActivityForm}
                className="h-9 rounded-md border border-border bg-card px-4 text-sm font-semibold text-primary transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste"
              >
                {editingActivityId ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Calendar + panel ───────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px] lg:items-start">

        {/* Calendar grid */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          {viewMode === 'month' ? (
            <MonthGrid
              weeks={calWeeks}
              month={month}
              todayStr={todayStr}
              selectedDay={selectedDay}
              actByDate={actByDate}
              showWeekends={monthShowsWeekends}
              onSelect={handleSelectDay}
              onDayDoubleClick={handleDayDoubleClick}
              onActivityClick={handleActivityClick}
              onActivityDoubleClick={handleActivityDoubleClick}
            />
          ) : (
            <WeekGrid
              weekDays={weekDays}
              todayStr={todayStr}
              selectedDay={selectedDay}
              actByDate={actByDate}
              showWeekends={weekShowsWeekends}
              onSelect={handleSelectDay}
              onDayDoubleClick={handleDayDoubleClick}
              onActivityClick={handleActivityClick}
              onActivityDoubleClick={handleActivityDoubleClick}
            />
          )}
        </div>

        {/* Day panel — always visible desktop, conditional mobile */}
        <div className={cn(selectedDay ? 'block' : 'hidden lg:block')}>
          <DayPanel
            selectedDay={selectedDay}
            activities={selectedActs}
            onClose={() => setSelectedDay(null)}
            onSelectAct={setSelectedAct}
          />
        </div>
      </div>

      {/* Activity detail modal */}
      {selectedAct && <ActivityModal activity={selectedAct} onClose={() => setSelectedAct(null)} />}
    </div>
  );
}

// ── Month grid ────────────────────────────────────────────────────────────────

function MonthGrid({
  weeks,
  month,
  todayStr,
  selectedDay,
  actByDate,
  showWeekends,
  onSelect,
  onDayDoubleClick,
  onActivityClick,
  onActivityDoubleClick,
}: {
  weeks: Date[][];
  month: number;
  todayStr: string;
  selectedDay: string | null;
  actByDate: Record<string, Actividad[]>;
  showWeekends: boolean;
  onSelect: (d: string) => void;
  onDayDoubleClick: (d: string) => void;
  onActivityClick: (act: Actividad) => void;
  onActivityDoubleClick: (act: Actividad) => void;
}) {
  return (
    <div className="space-y-px bg-border">
      {weeks.map((week) => {
        const visibleDays = showWeekends ? week : week.filter(isBusinessDay);

        return (
          <div key={toStr(week[0])} className="grid gap-px bg-border" style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
            {visibleDays.map((day) => {
              const dayStr     = toStr(day);
              const inMonth    = day.getMonth() === month;
              const isToday    = dayStr === todayStr;
              const isSelected = dayStr === selectedDay;
              const isWeekend  = !isBusinessDay(day);
              const acts       = actByDate[dayStr] ?? [];

              return (
                <div
                  key={dayStr}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(dayStr)}
                  onDoubleClick={() => onDayDoubleClick(dayStr)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(dayStr);
                    }
                  }}
                  className={cn(
                    'min-h-[88px] cursor-pointer p-1.5 text-left transition-colors sm:min-h-[104px] sm:p-2',
                    isSelected  ? 'bg-primary/10'                  :
                    isWeekend   ? 'bg-accent/45 hover:bg-accent'   :
                                  'bg-card hover:bg-accent/40',
                    !inMonth    && 'opacity-35'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{weekdayLabel(day)}</span>
                    <span className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                      isToday    ? 'bg-primary text-primary-foreground' :
                      isSelected ? 'text-primary font-bold' :
                                  'text-foreground'
                    )}>
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5">
                    {acts.slice(0, 2).map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onActivityClick(act);
                        }}
                        onDoubleClick={(event) => {
                          event.stopPropagation();
                          onActivityDoubleClick(act);
                        }}
                        className={cn('flex w-full items-center gap-1 rounded border px-1 py-0.5 text-left text-[10px] font-semibold leading-tight transition-opacity hover:opacity-80', TIPO[act.tipo].pill)}
                      >
                        <span className={cn('size-1.5 shrink-0 rounded-full', TIPO[act.tipo].dot)} aria-hidden />
                        <span className="truncate">{act.titulo}</span>
                      </button>
                    ))}
                    {acts.length > 2 && (
                      <p className="px-1 text-[10px] font-semibold text-muted-foreground">+{acts.length - 2} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Week grid ─────────────────────────────────────────────────────────────────

function WeekGrid({
  weekDays,
  todayStr,
  selectedDay,
  actByDate,
  showWeekends,
  onSelect,
  onDayDoubleClick,
  onActivityClick,
  onActivityDoubleClick,
}: {
  weekDays: Date[];
  todayStr: string;
  selectedDay: string | null;
  actByDate: Record<string, Actividad[]>;
  showWeekends: boolean;
  onSelect: (d: string) => void;
  onDayDoubleClick: (d: string) => void;
  onActivityClick: (act: Actividad) => void;
  onActivityDoubleClick: (act: Actividad) => void;
}) {
  const visibleDays = showWeekends ? weekDays : weekDays.filter(isBusinessDay);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[560px] divide-x divide-border" style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
        {visibleDays.map((day) => {
          const dayStr     = toStr(day);
          const isToday    = dayStr === todayStr;
          const isSelected = dayStr === selectedDay;
          const isWeekend  = !isBusinessDay(day);
          const acts       = actByDate[dayStr] ?? [];

          return (
            <div
              key={dayStr}
              onClick={() => onSelect(dayStr)}
              onDoubleClick={() => onDayDoubleClick(dayStr)}
              className={cn(
                'min-h-[200px] cursor-pointer p-2 transition-colors',
                isSelected ? 'bg-primary/10'                       :
                isWeekend  ? 'bg-muted/20 hover:bg-muted/40'       :
                             'bg-card hover:bg-accent/40'
              )}
            >
              <div className="mb-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{weekdayLabel(day)}</p>
                <div className={cn('mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-bold', isToday ? 'bg-primary text-primary-foreground' : 'text-foreground')}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {acts.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onActivityClick(act); }}
                    onDoubleClick={(e) => { e.stopPropagation(); onActivityDoubleClick(act); }}
                    className={cn('w-full rounded border px-1.5 py-1 text-left text-[11px] font-semibold leading-tight transition-opacity hover:opacity-75', TIPO[act.tipo].pill)}
                  >
                    {act.titulo}
                    {act.hora && <span className="ml-1 opacity-60">{act.hora}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Day panel ─────────────────────────────────────────────────────────────────

function DayPanel({
  selectedDay, activities, onClose, onSelectAct,
}: {
  selectedDay: string | null;
  activities: Actividad[];
  onClose: () => void;
  onSelectAct: (act: Actividad) => void;
}) {
  if (!selectedDay) {
    return (
      <div className="hidden h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center shadow-soft lg:flex">
        <div className="size-10 rounded-full bg-accent" aria-hidden />
        <p className="text-sm text-muted-foreground">Seleccioná un día para ver sus actividades</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Agenda</p>
          <h3 className="mt-0.5 text-sm font-bold capitalize text-foreground">{fechaLarga(selectedDay)}</h3>
        </div>
        <button
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cerrar panel"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {activities.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Sin actividades este día</p>
      ) : (
        <div className="divide-y divide-border">
          {activities.map((act) => (
            <button
              key={act.id}
              onClick={() => onSelectAct(act)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <span className={cn('mt-1 size-2 shrink-0 rounded-full', TIPO[act.tipo].dot)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{act.titulo}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-bold', TIPO[act.tipo].pill)}>
                    {TIPO[act.tipo].label}
                  </span>
                  {act.hora   && <span className="text-[11px] text-muted-foreground">{act.hora} hs</span>}
                  {act.materia && <span className="text-[11px] text-muted-foreground">{act.materia}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activity modal ────────────────────────────────────────────────────────────

function ActivityModal({ activity, onClose }: { activity: Actividad; onClose: () => void }) {
  const tipo = TIPO[activity.tipo];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-panel">
        <div className="flex items-start justify-between gap-3 p-5">
          <div>
            <span className={cn('rounded border px-2 py-0.5 text-xs font-bold', tipo.pill)}>{tipo.label}</span>
            <h2 className="mt-2 text-lg font-bold text-foreground">{formatAcademicLabel(activity.titulo)}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Cerrar"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-2 border-t border-border px-5 py-4">
          {activity.descripcion && (
            <p className="text-sm leading-6 text-foreground">{activity.descripcion}</p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="capitalize">{fechaLarga(activity.fecha)}</span>
            {activity.hora    && <span>· {activity.hora} hs</span>}
            {activity.materia && <span>· {activity.materia}</span>}
            {activity.grado   ? <span>· {formatAcademicLabel(activity.grado)}</span> : <span>· Toda la comunidad</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small shared components ───────────────────────────────────────────────────

function NavBtn({ onClick, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      {...rest}
    >
      {children}
    </button>
  );
}

function ToggleBtn({ active, onClick, border, children }: { active: boolean; onClick: () => void; border?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-semibold transition-colors',
        border && 'border-l border-border',
        active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function chunkWeeks(days: Date[]) {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function isBusinessDay(date: Date) {
  return BUSINESS_DAYS.has(date.getDay());
}

function nextBusinessDay(date: Date) {
  const next = new Date(date);
  do {
    next.setDate(next.getDate() + 1);
  } while (!isBusinessDay(next));
  return next;
}

function isCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
}

function weekdayLabel(date: Date) {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

function shouldRevealWeekend(dateStr: string, actByDate: Record<string, Actividad[]>, config: ConfigCalendario[]) {
  const date = fromStr(dateStr);
  if (isBusinessDay(date)) return true;
  const hasActivity = (actByDate[dateStr]?.length ?? 0) > 0;
  const hasConfig = config.some((item) => item.mostrarFinesSemana && dateStr >= item.desde && dateStr <= item.hasta);
  return hasActivity || hasConfig;
}

function hasWeekendExceptionInMonth(
  year: number,
  month: number,
  actByDate: Record<string, Actividad[]>,
  config: ConfigCalendario[]
) {
  const monthStart = toStr(new Date(year, month, 1));
  const monthEnd = toStr(new Date(year, month + 1, 0));

  const hasWeekendActivity = Object.keys(actByDate).some((dateStr) => {
    if (dateStr < monthStart || dateStr > monthEnd) return false;
    const date = fromStr(dateStr);
    return !isBusinessDay(date) && (actByDate[dateStr]?.length ?? 0) > 0;
  });

  const hasCalendarConfig = config.some(
    (item) => item.mostrarFinesSemana && item.desde <= monthEnd && item.hasta >= monthStart
  );

  return hasWeekendActivity || hasCalendarConfig;
}
