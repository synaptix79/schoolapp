
import { formatAcademicLabel } from '@/lib/academic-levels';
import { Upload } from 'lucide-react';

import { PrivatePhotoPlaceholder, PrivacyNote, PageIntro } from '@/components/app/demo-blocks';
import { TareasProfesorSection } from '@/components/app/tareas-view';
import { demoEntregas, demoGallery, demoTareas } from '@/lib/demo';

export default function ProfesorGaleriaPage() {
  // Demo: perfil de alumnos del grado asignado a Marta Benítez.
  const tareas  = demoTareas.filter((t) => t.grado === '3.º EEB');
  const entregas = demoEntregas;

  return (
    <div className="space-y-10">
      {/* ── Entregables y fotos ───────────────────────────────────────── */}
      <section className="space-y-6">
        <PageIntro
          eyebrow="Docente · Entregables"
          title="Entregables con foto de tarea"
          description="Flujo trazable para cargar evidencias, fotos de tareas y entregas privadas."
        />

        <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr]">
          <form className="rounded-lg border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Upload className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Subir entregable</h2>
                <p className="text-sm text-muted-foreground">Foto o evidencia para revisión.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <select className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm">
                <option>Ana López</option>
                <option>Mateo López</option>
                <option>3.º grado A · evidencia grupal</option>
              </select>
              <input className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm" placeholder="Descripción" />
              <label className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
                <input type="checkbox" defaultChecked />
                Visible para alumnos autorizados
              </label>
              <button type="button" className="h-10 w-full rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste">
                Subir demo
              </button>
            </div>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            {demoGallery.map((photo) => (
              <PrivatePhotoPlaceholder
                key={photo.id}
                title={photo.alumno}
                description={`${photo.descripcion} · ${formatAcademicLabel(photo.grado)}`}
                locked={!photo.consentimiento || !photo.visible}
              />
            ))}
          </div>
        </div>

        <PrivacyNote />
      </section>

      {/* ── Tareas y entregas ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Actividades por perfil de alumno</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            El profesor crea actividades, define modalidad y corrige las entregas recibidas desde cada perfil de Entregables.
          </p>
        </div>
        <TareasProfesorSection tareas={tareas} entregas={entregas} />
      </section>
    </div>
  );
}
