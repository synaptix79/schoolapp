'use client';
import { formatAcademicLabel } from '@/lib/academic-levels';


import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';
import { demoGrades, demoToday } from '@/lib/demo';

type ImportKind = 'grados' | 'alumnos' | 'asistencia';
type ImportRecord = Record<string, string>;
type RowErrors = Record<string, string>;

type ColumnDef = {
  key: string;
  label: string;
  example: string;
};

type ValidatedRow = {
  id: string;
  rowNumber: number;
  data: ImportRecord;
  errors: RowErrors;
  valid: boolean;
  dedupKey: string | null;
};

type ImportSummary = {
  created: number;
  updated: number;
  skipped: number;
};

type ValidatorTools = {
  isNivel: (value: string) => boolean;
  isParentesco: (value: string) => boolean;
  isEstadoAsistencia: (value: string) => boolean;
  isEmail: (value: string) => boolean;
};

type BulkImporterProps = {
  kind: ImportKind;
  title: string;
  description: string;
  roleLabel: string;
  allowedRole: 'direccion' | 'docente';
  teacherGrades?: string[];
};

const gradoColumns: ColumnDef[] = [
  { key: 'nivel', label: 'nivel', example: 'EEB' },
  { key: 'grado', label: 'grado', example: '3.º grado' },
  { key: 'seccion', label: 'seccion', example: 'A' },
  { key: 'anio_lectivo', label: 'anio_lectivo', example: '2026' }
];

const alumnoColumns: ColumnDef[] = [
  { key: 'nombre_completo', label: 'nombre_completo', example: 'Ana López' },
  { key: 'ci', label: 'ci', example: '4567890' },
  { key: 'fecha_nacimiento', label: 'fecha_nacimiento', example: '14/03/2017' },
  { key: 'grado', label: 'grado', example: '3.º grado' },
  { key: 'seccion', label: 'seccion', example: 'A' },
  { key: 'anio_lectivo', label: 'anio_lectivo', example: '2026' },
  { key: 'tipo_sangre', label: 'tipo_sangre', example: 'O+' },
  { key: 'contacto_emergencia', label: 'contacto_emergencia', example: '+595981000001' },
  { key: 'observaciones_medicas', label: 'observaciones_medicas', example: 'Alergia leve al polvo' },
  { key: 'tutor_nombre', label: 'tutor_nombre', example: 'María López' },
  { key: 'tutor_email', label: 'tutor_email', example: 'maria@example.com' },
  { key: 'parentesco', label: 'parentesco', example: 'madre' }
];

const asistenciaColumns: ColumnDef[] = [
  { key: 'ci', label: 'ci', example: '4567890' },
  { key: 'nombre_completo', label: 'nombre_completo', example: 'Ana López' },
  { key: 'estado', label: 'estado', example: 'presente' },
  { key: 'observacion', label: 'observacion', example: 'Llegó a horario' }
];

const attendanceRosterByGrade: Record<string, Array<{ ci: string; nombre: string }>> = {
  '1.º EEB B': [
    { ci: '5123400', nombre: 'Camila Torres' },
    { ci: '4987651', nombre: 'Mateo Ruiz' },
    { ci: '4876502', nombre: 'Lucía Benítez' }
  ],
  '3.º EEB A': [
    { ci: '4567890', nombre: 'Ana López' },
    { ci: '5123499', nombre: 'Pedro Rodas' },
    { ci: '4988120', nombre: 'Lucía Vera' },
    { ci: '4877661', nombre: 'Tomás Gómez' },
    { ci: '4766552', nombre: 'Martina Díaz' }
  ]
};

const existingStudentCis = ['4567890', '5123499'];

export function BulkImporter({
  kind,
  title,
  description,
  roleLabel,
  allowedRole,
  teacherGrades = ['3.º EEB A']
}: BulkImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRecord[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [createMissingGrades, setCreateMissingGrades] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(teacherGrades[0] ?? '3.º EEB A');
  const [selectedDate, setSelectedDate] = useState(demoToday);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(() => new Set(getInitialExistingKeys(kind, selectedGrade, selectedDate)));
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const columns = getColumns(kind);
  const validCount = validatedRows.filter((row) => row.valid).length;
  const errorCount = validatedRows.length - validCount;
  const invalidRows = validatedRows.filter((row) => !row.valid);
  const canConfirm = validCount > 0 && !isValidating;

  useEffect(() => {
    let active = true;

    if (rows.length === 0) {
      setValidatedRows([]);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    void validateRows(kind, rows, { createMissingGrades, selectedGrade, selectedDate })
      .then((nextRows) => {
        if (active) setValidatedRows(nextRows);
      })
      .finally(() => {
        if (active) setIsValidating(false);
      });

    return () => {
      active = false;
    };
  }, [kind, rows, createMissingGrades, selectedGrade, selectedDate]);

  async function downloadTemplate() {
    const XLSX = await loadXlsx();
    const templateRow = Object.fromEntries(columns.map((column) => [column.key, column.example]));
    const worksheet = XLSX.utils.json_to_sheet([templateRow], { header: columns.map((column) => column.key) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
    XLSX.writeFile(workbook, `plantilla-${kind}.xlsx`);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setParseError(null);
    setSummary(null);
    setFileName(file.name);

    try {
      const XLSX = await loadXlsx();
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json<ImportRecord>(sheet, { defval: '', raw: false });
      const normalized = parsed.map((row) => normalizeParsedRow(row, columns));
      setRows(normalized);
    } catch {
      setRows([]);
      setParseError('No se pudo leer el archivo. Revisá que sea .xlsx o .csv válido.');
    }
  }

  function updateCell(rowIndex: number, key: string, value: string) {
    setRows((current) =>
      current.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row))
    );
    setSummary(null);
  }

  function confirmImport() {
    const nextSavedKeys = new Set(savedKeys);
    const result: ImportSummary = { created: 0, updated: 0, skipped: errorCount };

    for (const row of validatedRows) {
      if (!row.valid || !row.dedupKey) continue;

      if (kind === 'grados') {
        if (nextSavedKeys.has(row.dedupKey)) {
          result.skipped += 1;
        } else {
          nextSavedKeys.add(row.dedupKey);
          result.created += 1;
        }
        continue;
      }

      if (nextSavedKeys.has(row.dedupKey)) {
        result.updated += 1;
      } else {
        nextSavedKeys.add(row.dedupKey);
        result.created += 1;
      }
    }

    setSavedKeys(nextSavedKeys);
    setSummary(result);
  }

  async function downloadErrorReport() {
    if (!invalidRows.length) return;
    const XLSX = await loadXlsx();

    const reportRows = invalidRows.map((row) => ({
      fila: row.rowNumber,
      ...row.data,
      errores: Object.entries(row.errors).map(([field, message]) => `${field}: ${message}`).join(' | ')
    }));
    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores');
    XLSX.writeFile(workbook, `errores-${kind}.xlsx`);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
            <FileSpreadsheet className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">{roleLabel}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void downloadTemplate()}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            <Download className="size-4" aria-hidden />
            Descargar plantilla
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste"
          >
            <Upload className="size-4" aria-hidden />
            Subir archivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(event) => void handleFile(event.currentTarget.files?.[0])}
          />
        </div>
      </div>

      {kind === 'asistencia' && (
        <div className="mt-5 grid gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-muted-foreground">
            Grado
            <select
              value={selectedGrade}
              onChange={(event) => {
                setSelectedGrade(event.target.value);
                setSummary(null);
              }}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {teacherGrades.map((grade) => (
                <option key={grade} value={grade}>{formatAcademicLabel(grade)}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold text-muted-foreground">
            Fecha
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setSummary(null);
              }}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>
      )}

      {kind === 'alumnos' && allowedRole === 'direccion' && (
        <label className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={createMissingGrades}
            onChange={(event) => setCreateMissingGrades(event.currentTarget.checked)}
            className="mt-1 size-4 rounded border-border text-primary focus:ring-primary/30"
          />
          <span>
            <span className="block font-semibold">Crear grados faltantes al confirmar</span>
            <span className="block text-xs leading-5 text-muted-foreground">
              Si está desactivado, una fila con grado/sección/año inexistente queda marcada con error para revisión.
            </span>
          </span>
        </label>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatusCard icon={CheckCircle2} label="Listas" value={isValidating ? 'Validando' : validCount} tone="ready" />
        <StatusCard icon={AlertTriangle} label="Con error" value={isValidating ? '...' : errorCount} tone="error" />
        <StatusCard icon={FileSpreadsheet} label="Archivo" value={fileName ? 'Cargado' : 'Pendiente'} detail={fileName ?? 'Usá la plantilla oficial'} />
      </div>

      {parseError && (
        <div className="mt-4 rounded-lg border border-canaan-alerta/30 bg-canaan-alerta-suave px-4 py-3 text-sm font-semibold text-canaan-alerta">
          {parseError}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
          <FileSpreadsheet className="mx-auto size-8 text-primary" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-foreground">Todavía no hay archivo para revisar.</p>
          <p className="mt-1 text-sm text-muted-foreground">Primero descargá la plantilla, completala y subila para previsualizar.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 min-w-0 rounded-lg border border-border">
            <table className={cn('block w-full border-collapse bg-card text-sm', kind !== 'alumnos' && 'xl:table xl:table-fixed')}>
              <thead className={cn('sr-only bg-accent text-left text-xs font-bold uppercase tracking-wide text-primary', kind !== 'alumnos' && 'xl:not-sr-only xl:table-header-group')}>
                <tr>
                  <th className="w-20 px-3 py-3">Fila</th>
                  <th className="w-28 px-3 py-3">Estado</th>
                  {columns.map((column) => (
                    <th key={column.key} className="break-all px-3 py-3">{column.label}</th>
                  ))}
                  <th className="px-3 py-3">Motivo</th>
                </tr>
              </thead>
              <tbody className={cn('block divide-y divide-border', kind !== 'alumnos' && 'xl:table-row-group')}>
                {validatedRows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'block min-w-0 p-3', kind !== 'alumnos' && 'xl:table-row xl:p-0', row.valid ? 'bg-emerald-50/80' : 'bg-canaan-alerta-suave/70'
                    )}
                  >
                    <td className={cn('block py-1 font-semibold text-muted-foreground', kind !== 'alumnos' && 'xl:table-cell xl:px-3 xl:py-2')}><span className={kind !== 'alumnos' ? 'xl:hidden' : undefined}>Fila </span>{row.rowNumber}</td>
                    <td className={cn('block py-1', kind !== 'alumnos' && 'xl:table-cell xl:px-3 xl:py-2')}>
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2 py-1 text-xs font-bold',
                          row.valid ? 'border-emerald-200 bg-emerald-100 text-emerald-800' : 'border-canaan-alerta/30 bg-canaan-alerta-suave text-canaan-alerta'
                        )}
                      >
                        {row.valid ? 'Lista' : 'Revisar'}
                      </span>
                    </td>
                    {columns.map((column) => {
                      const hasError = Boolean(row.errors[column.key]);
                      return (
                        <td key={column.key} className={cn('block min-w-0 py-1 align-top', kind !== 'alumnos' && 'xl:table-cell xl:px-3 xl:py-2')}>
                          <label className={cn('mb-1 block text-xs font-semibold text-muted-foreground', kind !== 'alumnos' && 'xl:hidden')} htmlFor={`import-${kind}-${rowIndex}-${column.key}`}>{column.label}</label>
                          <input
                            id={`import-${kind}-${rowIndex}-${column.key}`}
                            aria-label={`${column.label}, fila ${row.rowNumber}`}
                            value={row.data[column.key] ?? ''}
                            onChange={(event) => updateCell(rowIndex, column.key, event.target.value)}
                            className={cn(
                              'h-9 w-full rounded-md border bg-card px-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15',
                              hasError ? 'border-canaan-alerta/50 bg-canaan-alerta-suave' : 'border-border'
                            )}
                          />
                          {hasError && <p className="mt-1 text-[11px] font-semibold text-canaan-alerta">{row.errors[column.key]}</p>}
                        </td>
                      );
                    })}
                    <td className={cn('block break-words py-1 align-top text-xs leading-5 text-muted-foreground', kind !== 'alumnos' && 'xl:table-cell xl:px-3 xl:py-2')}>
                      {row.valid ? (
                        <span className="font-semibold text-emerald-700">Lista para confirmar</span>
                      ) : (
                        Object.entries(row.errors).map(([field, message]) => (
                          <div key={field}><span className="font-bold text-canaan-alerta">{field}:</span> {message}</div>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm font-semibold text-foreground">
              {validCount} listas · {errorCount} con error
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void downloadErrorReport()}
                disabled={invalidRows.length === 0}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-primary transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Download className="size-4" aria-hidden />
                Descargar reporte de errores
              </button>
              <button
                type="button"
                onClick={confirmImport}
                disabled={!canConfirm}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Confirmar filas válidas
              </button>
            </div>
          </div>
        </>
      )}

      {summary && (
        <div className="mt-5 grid gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 sm:grid-cols-3">
          <SummaryItem label="Creados" value={summary.created} />
          <SummaryItem label="Actualizados" value={summary.updated} />
          <SummaryItem label="Omitidos / error" value={summary.skipped} />
        </div>
      )}
    </section>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'neutral'
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number | string;
  detail?: string;
  tone?: 'ready' | 'error' | 'neutral';
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            'size-4',
            tone === 'ready' ? 'text-emerald-700' : tone === 'error' ? 'text-canaan-alerta' : 'text-primary'
          )}
          aria-hidden
        />
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 text-lg font-bold text-foreground">{value}</div>
      {detail && <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function getColumns(kind: ImportKind) {
  if (kind === 'grados') return gradoColumns;
  if (kind === 'alumnos') return alumnoColumns;
  return asistenciaColumns;
}

function normalizeParsedRow(row: ImportRecord, columns: ColumnDef[]) {
  return Object.fromEntries(
    columns.map((column) => [column.key, stringifyValue(row[column.key] ?? row[column.label] ?? '')])
  );
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

async function validateRows(
  kind: ImportKind,
  rows: ImportRecord[],
  options: { createMissingGrades: boolean; selectedGrade: string; selectedDate: string }
): Promise<ValidatedRow[]> {
  const validators = await loadValidators();
  const duplicateTracker = new Map<string, number>();

  return rows.map((row, index) => {
    const base = normalizeParsedRow(row, getColumns(kind));
    const errors: RowErrors = {};
    let dedupKey: string | null = null;

    if (kind === 'grados') {
      dedupKey = validateGradeRow(base, errors, validators);
    } else if (kind === 'alumnos') {
      dedupKey = validateStudentRow(base, errors, options.createMissingGrades, validators);
    } else {
      dedupKey = validateAttendanceRow(base, errors, options.selectedGrade, options.selectedDate, validators);
    }

    if (dedupKey) {
      const currentCount = duplicateTracker.get(dedupKey) ?? 0;
      duplicateTracker.set(dedupKey, currentCount + 1);
      if (currentCount > 0) {
        errors._duplicado = 'La fila está repetida dentro del archivo.';
      }
    }

    return {
      id: `${kind}-${index}-${dedupKey ?? 'row'}`,
      rowNumber: index + 2,
      data: base,
      errors,
      valid: Object.keys(errors).length === 0,
      dedupKey
    };
  });
}

function validateGradeRow(row: ImportRecord, errors: RowErrors, validators: ValidatorTools) {
  const nivel = row.nivel;
  const grado = row.grado;
  const seccion = row.seccion;
  const anio = row.anio_lectivo;

  if (!validators.isNivel(nivel)) errors.nivel = 'Debe ser Inicial, EEB o Medio.';
  if (!grado) errors.grado = 'Campo obligatorio.';
  if (!seccion) errors.seccion = 'Campo obligatorio.';
  if (!isValidSchoolYear(anio)) errors.anio_lectivo = 'Debe ser un año válido, ej. 2026.';

  return grado && seccion && anio ? gradeKey(grado, seccion, anio) : null;
}

function validateStudentRow(
  row: ImportRecord,
  errors: RowErrors,
  createMissingGrades: boolean,
  validators: ValidatorTools
) {
  const ci = normalizeCi(row.ci);
  const grado = row.grado;
  const seccion = row.seccion;
  const anio = row.anio_lectivo;

  if (!row.nombre_completo) errors.nombre_completo = 'Campo obligatorio.';
  if (!ci || !/^\d{5,12}$/.test(ci)) errors.ci = 'Debe tener entre 5 y 12 dígitos.';
  if (!isValidDate(row.fecha_nacimiento)) errors.fecha_nacimiento = 'Usá DD/MM/AAAA.';
  if (!grado) errors.grado = 'Campo obligatorio.';
  if (!seccion) errors.seccion = 'Campo obligatorio.';
  if (!isValidSchoolYear(anio)) errors.anio_lectivo = 'Debe ser un año válido, ej. 2026.';
  if (row.tutor_email && !validators.isEmail(row.tutor_email)) errors.tutor_email = 'Email inválido.';
  if (row.parentesco && !validators.isParentesco(row.parentesco.toLowerCase())) errors.parentesco = 'Debe ser madre, padre o tutor.';

  if (grado && seccion && anio && !createMissingGrades && !existingGradeKeys.has(gradeKey(grado, seccion, anio))) {
    errors.grado = 'El grado/sección/año no existe.';
  }

  return ci || null;
}

function validateAttendanceRow(
  row: ImportRecord,
  errors: RowErrors,
  selectedGrade: string,
  selectedDate: string,
  validators: ValidatorTools
) {
  const roster = attendanceRosterByGrade[selectedGrade] ?? [];
  const ci = normalizeCi(row.ci);
  const name = normalizeText(row.nombre_completo);
  const matchedStudent = roster.find((student) => normalizeCi(student.ci) === ci) ??
    roster.find((student) => name && normalizeText(student.nombre) === name);

  if (!ci && !row.nombre_completo) errors.ci = 'Indicá ci o nombre_completo.';
  if (!matchedStudent) errors.ci = 'No pertenece al grado seleccionado.';
  if (!validators.isEstadoAsistencia(row.estado.toLowerCase())) {
    errors.estado = 'Debe ser presente, ausente, justificado o tarde.';
  }

  return matchedStudent ? `${selectedGrade}|${selectedDate}|${normalizeCi(matchedStudent.ci)}` : null;
}

const existingGradeKeys = new Set(
  demoGrades.map((grade) => gradeKey(grade.grado, grade.seccion, String(grade.anioLectivo)))
);

function getInitialExistingKeys(kind: ImportKind, selectedGrade: string, selectedDate: string) {
  if (kind === 'grados') return [...existingGradeKeys];
  if (kind === 'alumnos') return existingStudentCis;
  return [`${selectedGrade}|${selectedDate}|4567890`];
}

function gradeKey(grado: string, seccion: string, anio: string) {
  return `${normalizeGrade(grado)}|${seccion.trim().toUpperCase()}|${anio.trim()}`;
}

function normalizeGrade(value: string) {
  return value.trim().replace(/\./g, '').replace(/\bgrado\b/gi, 'EEB').replace(/\s+/g, ' ').toLowerCase();
}

function normalizeCi(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function isValidSchoolYear(value: string) {
  return /^\d{4}$/.test(value) && Number(value) >= 2020 && Number(value) <= 2100;
}

function isValidDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

let validatorsPromise: Promise<ValidatorTools> | null = null;

function loadValidators() {
  validatorsPromise ??= import('zod').then(({ z }) => {
    const nivelSchema = z.enum(['Inicial', 'EEB', 'Medio']);
    const parentescoSchema = z.enum(['madre', 'padre', 'tutor']);
    const estadoAsistenciaSchema = z.enum(['presente', 'ausente', 'justificado', 'tarde']);
    const emailSchema = z.string().email();

    return {
      isNivel: (value: string) => nivelSchema.safeParse(value).success,
      isParentesco: (value: string) => parentescoSchema.safeParse(value).success,
      isEstadoAsistencia: (value: string) => estadoAsistenciaSchema.safeParse(value).success,
      isEmail: (value: string) => emailSchema.safeParse(value).success,
    };
  });

  return validatorsPromise;
}

function loadXlsx() {
  return import('xlsx');
}
