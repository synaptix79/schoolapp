'use client';

import { formatAcademicLabel } from '@/lib/academic-levels';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link2, Loader2, RefreshCw, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react';

import type { GuardianLinkStatus, RelationshipType } from '@/lib/guardian/types';

type Guardian = {
  id: string;
  nombre_completo: string;
  activo: boolean;
};

type Student = {
  id: string;
  nombre: string;
  grado: string | null;
  seccion: string | null;
  turno: string | null;
  activo: boolean;
};

type CatalogLink = {
  guardian_user_id: string;
  student_id: string;
  relationship_type: RelationshipType;
  is_primary: boolean;
  status: GuardianLinkStatus;
};

type GuardianLink = {
  id: string;
  student_id: string;
  relationship_type: RelationshipType;
  is_primary: boolean;
  status: GuardianLinkStatus;
  alumnos: Student;
};

export function GuardianLinkManager() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [catalogLinks, setCatalogLinks] = useState<CatalogLink[]>([]);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [selectedGuardianId, setSelectedGuardianId] = useState('');
  const [guardianSearch, setGuardianSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('Padre');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/guardians', { cache: 'no-store' });
      const payload = await response.json().catch(() => null) as {
        guardians?: Guardian[];
        students?: Student[];
        links?: CatalogLink[];
        error?: string;
      } | null;
      if (!response.ok) throw new Error(payload?.error ?? 'No se pudo cargar el catálogo.');
      const nextGuardians = payload?.guardians ?? [];
      setGuardians(nextGuardians);
      setStudents(payload?.students ?? []);
      setCatalogLinks(payload?.links ?? []);
      setSelectedGuardianId((current) => current || nextGuardians[0]?.id || '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el catálogo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGuardianLinks = useCallback(async (guardianId: string) => {
    if (!guardianId) {
      setLinks([]);
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/admin/guardians/${guardianId}/students`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null) as { links?: GuardianLink[]; error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? 'No se pudieron cargar las vinculaciones.');
      setLinks(payload?.links ?? []);
    } catch (requestError) {
      setLinks([]);
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar las vinculaciones.');
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    void loadGuardianLinks(selectedGuardianId);
  }, [loadGuardianLinks, selectedGuardianId]);

  const filteredGuardians = useMemo(() => {
    const query = guardianSearch.trim().toLocaleLowerCase('es');
    return query
      ? guardians.filter((guardian) => guardian.nombre_completo.toLocaleLowerCase('es').includes(query))
      : guardians;
  }, [guardianSearch, guardians]);

  const availableStudents = useMemo(() => {
    const linkedIds = new Set(links.map((link) => link.student_id));
    const query = studentSearch.trim().toLocaleLowerCase('es');
    return students.filter((student) => {
      if (linkedIds.has(student.id)) return false;
      return !query || `${student.nombre} ${student.grado ?? ''} ${student.seccion ?? ''}`.toLocaleLowerCase('es').includes(query);
    });
  }, [links, studentSearch, students]);

  const selectedStudentGuardians = useMemo(() => {
    if (!selectedStudentId) return [];
    const guardianById = new Map(guardians.map((guardian) => [guardian.id, guardian]));
    return catalogLinks
      .filter((link) => link.student_id === selectedStudentId)
      .map((link) => ({ ...link, guardian: guardianById.get(link.guardian_user_id) }))
      .filter((link) => link.guardian);
  }, [catalogLinks, guardians, selectedStudentId]);

  async function createLink() {
    if (!selectedGuardianId || !selectedStudentId) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/guardians/${selectedGuardianId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId, relationshipType, isPrimary }),
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? 'No se pudo crear la vinculación.');
      setMessage('Vinculación creada correctamente.');
      setSelectedStudentId('');
      setIsPrimary(false);
      await Promise.all([loadGuardianLinks(selectedGuardianId), loadCatalog()]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo crear la vinculación.');
    } finally {
      setIsSaving(false);
    }
  }

  async function updateLink(link: GuardianLink, changes: Record<string, unknown>) {
    setError(null);
    const response = await fetch(
      `/api/admin/guardians/${selectedGuardianId}/students/${link.student_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      },
    );
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      setError(payload?.error ?? 'No se pudo actualizar la vinculación.');
      return;
    }
    setMessage('Vinculación actualizada.');
    await Promise.all([loadGuardianLinks(selectedGuardianId), loadCatalog()]);
  }

  async function toggleStatus(link: GuardianLink) {
    const nextStatus: GuardianLinkStatus = link.status === 'active' ? 'inactive' : 'active';
    if (nextStatus === 'inactive' && !window.confirm(`¿Desactivar el acceso a ${link.alumnos.nombre}?`)) return;
    await updateLink(link, { status: nextStatus });
  }

  async function deleteLink(link: GuardianLink) {
    if (!window.confirm(`¿Eliminar la vinculación con ${link.alumnos.nombre}? Esta acción revoca el acceso inmediatamente.`)) return;
    setError(null);
    const response = await fetch(
      `/api/admin/guardians/${selectedGuardianId}/students/${link.student_id}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? 'No se pudo eliminar la vinculación.');
      return;
    }
    setMessage('Vinculación eliminada.');
    await Promise.all([loadGuardianLinks(selectedGuardianId), loadCatalog()]);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-border bg-card">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
        Cargando encargados y alumnos…
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <aside className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <label className="text-sm font-bold text-foreground" htmlFor="guardian-search">Buscar padre o encargado</label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="guardian-search"
            value={guardianSearch}
            onChange={(event) => setGuardianSearch(event.target.value)}
            placeholder="Nombre del encargado"
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm"
          />
        </div>
        <div className="mt-3 max-h-[460px] space-y-2 overflow-y-auto">
          {filteredGuardians.map((guardian) => (
            <button
              key={guardian.id}
              type="button"
              onClick={() => setSelectedGuardianId(guardian.id)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                guardian.id === selectedGuardianId ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-primary">
                <UserRound className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block break-words font-semibold text-foreground">{guardian.nombre_completo}</span>
                <span className="text-xs text-muted-foreground">{guardian.activo ? 'Cuenta activa' : 'Cuenta bloqueada'}</span>
              </span>
            </button>
          ))}
          {filteredGuardians.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No se encontraron encargados.</p> : null}
        </div>
      </aside>

      <div className="space-y-5">
        {error ? <Message tone="error">{error}</Message> : null}
        {message ? <Message tone="success">{message}</Message> : null}

        <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-bold text-foreground">Vincular un alumno</h2>
              <p className="text-sm text-muted-foreground">Solo aparecen alumnos del mismo colegio.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="student-search" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Buscar alumno</label>
              <input
                id="student-search"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Nombre, grado o sección"
                className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
            <select
              aria-label="Alumno para vincular"
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Seleccionar alumno…</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>{student.nombre} · {formatAcademicLabel(student.grado ?? 'Sin grado')} {student.seccion ?? ''}</option>
              ))}
            </select>
            <select
              aria-label="Tipo de relación"
              value={relationshipType}
              onChange={(event) => setRelationshipType(event.target.value as RelationshipType)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {(['Padre', 'Madre', 'Tutor', 'Encargado', 'Abuelo/a', 'Otro'] as RelationshipType[]).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-sm font-semibold">
              <input type="checkbox" checked={isPrimary} onChange={(event) => setIsPrimary(event.target.checked)} />
              Encargado principal
            </label>
            <button
              type="button"
              disabled={!selectedGuardianId || !selectedStudentId || isSaving}
              onClick={() => void createLink()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
              Crear vinculación
            </button>
          </div>

          {selectedStudentGuardians.length > 0 ? (
            <div className="mt-4 rounded-lg bg-muted/45 p-3 text-sm">
              <span className="font-semibold text-foreground">Encargados ya vinculados al alumno:</span>{' '}
              {selectedStudentGuardians.map((link) => link.guardian!.nombre_completo).join(', ')}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-foreground">Alumnos relacionados</h2>
              <p className="text-sm text-muted-foreground">Activá, desactivá o eliminá vinculaciones.</p>
            </div>
            <button type="button" onClick={() => void loadGuardianLinks(selectedGuardianId)} aria-label="Actualizar vinculaciones" className="flex size-10 items-center justify-center rounded-lg border border-border">
              <RefreshCw className="size-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {links.map((link) => (
              <article key={link.id} className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground">{link.alumnos.nombre}</h3>
                    {link.is_primary ? <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">Principal</span> : null}
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${link.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {link.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatAcademicLabel(link.alumnos.grado ?? 'Sin grado')} · {link.alumnos.seccion ?? 'Sin sección'} · {link.relationship_type}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label={`Tipo de relación con ${link.alumnos.nombre}`}
                    value={link.relationship_type}
                    onChange={(event) => void updateLink(link, { relationshipType: event.target.value })}
                    className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-bold"
                  >
                    {(['Padre', 'Madre', 'Tutor', 'Encargado', 'Abuelo/a', 'Otro'] as RelationshipType[]).map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  {!link.is_primary && link.status === 'active' ? (
                    <button type="button" onClick={() => void updateLink(link, { isPrimary: true })} className="h-9 rounded-lg border border-border px-3 text-xs font-bold">Marcar principal</button>
                  ) : null}
                  <button type="button" onClick={() => void toggleStatus(link)} className="h-9 rounded-lg border border-border px-3 text-xs font-bold">
                    {link.status === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button type="button" onClick={() => void deleteLink(link)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-canaan-alerta/30 px-3 text-xs font-bold text-canaan-alerta">
                    <Trash2 className="size-3.5" aria-hidden />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
            {links.length === 0 ? <p className="rounded-lg bg-muted/45 p-4 text-sm text-muted-foreground">Este encargado todavía no tiene alumnos vinculados.</p> : null}
          </div>
        </section>

        <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-muted-foreground">Las validaciones de rol, colegio y vínculo se aplican nuevamente en el servidor y en la base de datos.</p>
        </div>
      </div>
    </div>
  );
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border p-3 text-sm font-semibold ${tone === 'error' ? 'border-canaan-alerta/30 bg-canaan-alerta-suave text-canaan-alerta' : 'border-primary/20 bg-primary/5 text-primary'}`}>
      {children}
    </div>
  );
}
