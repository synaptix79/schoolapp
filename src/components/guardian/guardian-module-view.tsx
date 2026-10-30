'use client';

import { useGuardianStudent } from '@/lib/guardian/student-context';
import type { GuardianModule, GuardianModuleResponse } from '@/lib/guardian/types';
import { useStudentResource } from '@/lib/guardian/use-student-resource';

import { EmptyModule, ErrorState, LoadingState } from './guardian-dashboard';

export function GuardianModuleView({
  module,
  eyebrow,
  title,
  description,
  emptyMessage,
}: {
  module: GuardianModule;
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
}) {
  const { selectedStudent } = useGuardianStudent();
  const { data, isLoading, error, reload } = useStudentResource<GuardianModuleResponse>(module);

  if (!selectedStudent) return null;
  if (isLoading) return <LoadingState message={`Cargando ${title.toLowerCase()} de ${selectedStudent.nombre}…`} />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudo cargar la información.'} onRetry={() => void reload()} />;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-bold text-primary">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description} Alumno actual: <span className="font-semibold text-foreground">{selectedStudent.nombre}</span>.
        </p>
      </header>

      {data.items.length === 0 ? (
        <EmptyModule message={emptyMessage} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item, index) => (
            <article key={String(item.id ?? index)} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <RecordCard item={item} module={module} studentId={selectedStudent.id} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordCard({
  item,
  module,
  studentId,
}: {
  item: Record<string, unknown>;
  module: GuardianModule;
  studentId: string;
}) {
  const preferredFields = fieldOrder[module];
  const fields = preferredFields
    .filter((field) => item[field] !== undefined && item[field] !== null)
    .map((field) => [field, item[field]] as const);

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">Registro disponible.</p>;
  }

  const [primary, ...rest] = fields;
  return (
    <>
      <p className="text-lg font-bold text-foreground">{formatValue(primary[1], primary[0])}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary">{fieldLabels[primary[0]] ?? primary[0]}</p>
      <dl className="mt-4 space-y-3">
        {rest.map(([field, value]) => (
          <div key={field}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {fieldLabels[field] ?? field.replaceAll('_', ' ')}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">{formatValue(value, field)}</dd>
          </div>
        ))}
      </dl>
      {module === 'documents' && typeof item.id === 'string' ? (
        <a
          href={`/api/guardian/students/${encodeURIComponent(studentId)}/documents/${encodeURIComponent(item.id)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Abrir documento
        </a>
      ) : null}
    </>
  );
}

const fieldOrder: Record<GuardianModule, string[]> = {
  attendance: ['fecha', 'estado', 'observacion'],
  grades: ['materia', 'nota', 'periodo', 'texto', 'tipo', 'observacion', 'fecha', 'created_at'],
  subjects: ['nombre', 'profesor_id'],
  schedule: ['dia_semana', 'hora_inicio', 'hora_fin', 'aula', 'turno'],
  assignments: ['titulo', 'materia', 'consigna', 'vence_at', 'entrega'],
  communications: ['titulo', 'contenido', 'grado', 'publicado_at'],
  payments: ['concepto', 'estado', 'monto', 'moneda', 'vencimiento', 'pagado_at'],
  documents: ['nombre', 'tipo', 'created_at'],
};

const fieldLabels: Record<string, string> = {
  fecha: 'Fecha',
  estado: 'Estado',
  observacion: 'Observación',
  materia: 'Materia',
  nota: 'Calificación',
  periodo: 'Período',
  texto: 'Observación académica',
  tipo: 'Tipo',
  created_at: 'Registrado',
  nombre: 'Nombre',
  profesor_id: 'Docente',
  dia_semana: 'Día',
  hora_inicio: 'Inicio',
  hora_fin: 'Fin',
  aula: 'Aula',
  turno: 'Turno',
  titulo: 'Título',
  consigna: 'Consigna',
  vence_at: 'Vencimiento',
  entrega: 'Entrega',
  contenido: 'Contenido',
  grado: 'Alcance',
  publicado_at: 'Publicado',
  concepto: 'Concepto',
  monto: 'Monto',
  moneda: 'Moneda',
  vencimiento: 'Vencimiento',
  pagado_at: 'Pagado',
};

function formatValue(value: unknown, field: string) {
  if (field === 'dia_semana' && typeof value === 'number') {
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][value - 1] ?? String(value);
  }
  if (typeof value === 'object' && value !== null) {
    const delivery = value as { estado?: string };
    return delivery.estado ?? 'Sin entrega';
  }
  if (typeof value === 'string' && (field.endsWith('_at') || field === 'fecha' || field === 'vencimiento')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat('es-PY', { dateStyle: 'medium' }).format(date);
  }
  return String(value);
}
