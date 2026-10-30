/** Academic labels are presentation only; existing database values remain unchanged. */
export type AcademicLevel = 'inicial' | 'eeb' | 'media';
export type AcademicStage = { id: string; level: AcademicLevel; label: string; cycle: 1 | 2 | 3 | null };
export type AcademicOffering = { stageId: string; schoolId: string; schoolYear: number; section: string; shift?: string | null };

export const academicStages: AcademicStage[] = [
  ...['Maternal', 'Prejardín', 'Jardín', 'Preescolar'].map((label) => ({ id: label.toLocaleLowerCase('es-PY'), level: 'inicial' as const, label, cycle: null })),
  ...Array.from({ length: 9 }, (_, index) => ({ id: `${index + 1}eeb`, level: 'eeb' as const, label: `${index + 1}.º grado`, cycle: (Math.floor(index / 3) + 1) as 1 | 2 | 3 })),
  ...Array.from({ length: 3 }, (_, index) => ({ id: `${index + 1}em`, level: 'media' as const, label: `${index + 1}.º curso · Educación Media`, cycle: null })),
];

/** Only offerings explicitly supplied by an institution are considered available. */
export function stagesForSchool(offerings: AcademicOffering[], schoolId: string, schoolYear: number) {
  const ids = new Set(offerings.filter((item) => item.schoolId === schoolId && item.schoolYear === schoolYear).map((item) => item.stageId));
  return academicStages.filter((stage) => ids.has(stage.id));
}

/** Formats recognized legacy values without changing identifiers or unknown institution-defined labels. */
export function formatAcademicLabel(value: string): string {
  return value
    .replace(/\b(10|11|12)\.º\s+grado\b/gi, (_, grade: string) => `${Number(grade) - 9}.º curso · Educación Media`)
    .replace(/\b([1-9])\.º\s+EEB\b/gi, '$1.º grado')
    .replace(/\b([1-3])\.º\s+(?:Nivel Medio|Educación Media|EM)\b/gi, '$1.º curso · Educación Media')
    .replace(/\b([1-9])eeb\b/gi, '$1.º grado')
    .replace(/\b([1-3])em\b/gi, '$1.º curso · Educación Media');
}
