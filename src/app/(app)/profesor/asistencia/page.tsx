'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarDays, ClipboardCheck, PlayCircle, UserCheck, UserX } from 'lucide-react';

import { BulkImporter } from '@/components/app/bulk-importer';
import { PageIntro } from '@/components/app/demo-blocks';
import { demoAlumnosPorGrado, demoDocentePerfil, demoToday } from '@/lib/demo';

const alumnosDelGrado = demoAlumnosPorGrado['3.º EEB A'].map((alumno, index) => ({
  ...alumno,
  asistencia: ['96%', '94%', '98%', '92%', '95%'][index] ?? '95%'
}));

type EstadoAsistencia = 'sin_marcar' | 'presente' | 'ausente' | 'justificado' | 'tarde';

const ESTADO_LABEL: Record<EstadoAsistencia, string> = {
  sin_marcar: 'Sin marcar',
  presente: 'Presente',
  ausente: 'Ausente',
  justificado: 'Justificado',
  tarde: 'Tarde'
};

const ESTADO_STYLE: Record<EstadoAsistencia, string> = {
  sin_marcar: 'border-border bg-muted/30 text-muted-foreground',
  presente: 'border-border bg-accent text-primary',
  ausente: 'border-canaan-alerta/30 bg-canaan-alerta-suave text-canaan-alerta',
  justificado: 'border-border bg-canaan-celeste-suave text-primary',
  tarde: 'border-canaan-alerta/30 bg-canaan-alerta-suave text-canaan-alerta'
};

const initialEstados = Object.fromEntries(alumnosDelGrado.map((alumno) => [alumno.id, 'sin_marcar' as EstadoAsistencia]));

export default function ProfesorAsistenciaPage() {
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [estados, setEstados] = useState<Record<string, EstadoAsistencia>>(initialEstados);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allIds = alumnosDelGrado.map((alumno) => alumno.id);
  const allSelected = selectedIds.length === allIds.length;
  const partiallySelected = selectedIds.length > 0 && !allSelected;
  const presentCount = Object.values(estados).filter((estado) => estado === 'presente').length;
  const absentCount = Object.values(estados).filter((estado) => estado === 'ausente').length;
  const pendingCount = Object.values(estados).filter((estado) => estado === 'sin_marcar').length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partiallySelected;
    }
  }, [partiallySelected]);

  function openRegistro() {
    setRegistroAbierto(true);
    setSelectedIds(allIds);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function selectAll() {
    setSelectedIds(allIds);
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function toggleAllSelection(checked: boolean) {
    if (checked) {
      selectAll();
    } else {
      clearSelection();
    }
  }

  function applyToSelected(estado: EstadoAsistencia) {
    if (selectedIds.length === 0) return;
    setEstados((current) => ({
      ...current,
      ...Object.fromEntries(selectedIds.map((id) => [id, estado]))
    }));
  }

  function applyToAll(estado: EstadoAsistencia) {
    setSelectedIds(allIds);
    setEstados(Object.fromEntries(allIds.map((id) => [id, estado])));
  }

  function setAlumnoEstado(id: string, estado: EstadoAsistencia) {
    setEstados((current) => ({ ...current, [id]: estado }));
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow="Docente · asistencia"
        title="Asistencia bajo demanda."
        description="No es un paso obligatorio del día. El docente abre el registro únicamente cuando necesita llamar lista para un grado."
        aside={
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Hoy: <span className="font-semibold text-foreground">{formatDate(demoToday)}</span>
          </div>
        }
      />

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              <ClipboardCheck className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-bold text-foreground">3.º grado A</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Si no se llama asistencia hoy, no queda pendiente ni se registra ausencia automática.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openRegistro}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste disabled:cursor-not-allowed disabled:opacity-60"
            disabled={registroAbierto}
          >
            <PlayCircle className="size-4" aria-hidden />
            {registroAbierto ? 'Registro abierto para hoy' : 'Llamar asistencia'}
          </button>
        </div>

        {!registroAbierto ? (
          <div className="mt-5 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
            <CalendarDays className="mx-auto size-8 text-primary" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-foreground">Sin registro de asistencia para hoy.</p>
            <p className="mt-1 text-sm text-muted-foreground">Esto es válido: la asistencia se crea solo cuando el docente la activa.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-accent px-4 py-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold text-primary">Registro de hoy · {formatDate(demoToday)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedIds.length} seleccionados · {presentCount} presentes · {absentCount} ausentes · {pendingCount} sin marcar
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyToAll('presente')}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-canaan-celeste"
                  >
                    <UserCheck className="size-3.5" aria-hidden />
                    Todos presentes
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <BulkButton disabled={selectedIds.length === 0} onClick={() => applyToSelected('presente')} tone="primary">
                  Marcar presente
                </BulkButton>
                <BulkButton disabled={selectedIds.length === 0} onClick={() => applyToSelected('ausente')} tone="warning">
                  Marcar ausente
                </BulkButton>
                <BulkButton disabled={selectedIds.length === 0} onClick={() => applyToSelected('justificado')}>
                  Justificado
                </BulkButton>
                <BulkButton disabled={selectedIds.length === 0} onClick={() => applyToSelected('tarde')}>
                  Tarde
                </BulkButton>
              </div>
            </div>

            <div className="divide-y divide-border">
              <div className="bg-card px-4 py-3">
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-bold text-foreground">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => toggleAllSelection(event.currentTarget.checked)}
                    className="size-5 rounded border-border text-primary focus:ring-primary/30"
                  />
                  Seleccionar todo
                </label>
              </div>

              {alumnosDelGrado.map((child) => {
                const selected = selectedIds.includes(child.id);
                const estado = estados[child.id] ?? 'sin_marcar';

                return (
                  <div
                    key={child.id}
                    className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_360px_160px] lg:items-center"
                  >
                    <label className="flex min-w-0 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelected(child.id)}
                        className="size-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground">{child.nombre}</span>
                        <span className="block text-xs text-muted-foreground">3.º grado · Sección A</span>
                      </span>
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${ESTADO_STYLE[estado]}`}>
                        {ESTADO_LABEL[estado]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAlumnoEstado(child.id, 'presente')}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-bold text-primary transition-colors hover:bg-accent"
                      >
                        <UserCheck className="size-3.5" aria-hidden />
                        Presente
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlumnoEstado(child.id, 'ausente')}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-canaan-alerta/30 bg-canaan-alerta-suave px-3 text-xs font-bold text-canaan-alerta transition-opacity hover:opacity-80"
                      >
                        <UserX className="size-3.5" aria-hidden />
                        Ausente
                      </button>
                    </div>

                    <span className="rounded-md bg-muted/40 px-3 py-2 text-sm font-semibold text-muted-foreground">{child.asistencia} general</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <BulkImporter
        kind="asistencia"
        title="Importar asistencia por Excel o CSV"
        description="Opcional para el docente: elegí grado y fecha, subí la planilla, revisá errores y confirmá solo las filas válidas. Reimportar la misma fecha actualiza el estado."
        roleLabel="Docente · carga masiva"
        allowedRole="docente"
        teacherGrades={demoDocentePerfil.grados}
      />
    </div>
  );
}

function BulkButton({
  children,
  disabled,
  onClick,
  tone = 'neutral'
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
  tone?: 'neutral' | 'primary' | 'warning';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-9 rounded-md px-3 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        tone === 'primary'
          ? 'bg-primary text-primary-foreground hover:bg-canaan-celeste'
          : tone === 'warning'
            ? 'border border-canaan-alerta/30 bg-canaan-alerta-suave text-canaan-alerta hover:opacity-80'
            : 'border border-border bg-card text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
