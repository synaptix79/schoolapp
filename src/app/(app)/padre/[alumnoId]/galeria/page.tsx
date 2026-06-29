import { notFound } from 'next/navigation';

import { PageIntro, PrivacyNote, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { TareasAlumnoView } from '@/components/app/tareas-view';
import { demoChildren, demoEntregas, demoGallery, demoTareas } from '@/lib/demo';

export default async function AlumnoGaleriaPage({ params }: { params: Promise<{ alumnoId: string }> }) {
  const { alumnoId } = await params;
  const child = demoChildren.find((c) => c.id === alumnoId);

  if (!child) notFound();

  const photos = demoGallery.filter(
    (p) => p.alumnoId === child.id && p.visible && p.consentimiento && child.consentimientoFotos
  );
  const tareas  = demoTareas.filter((t) => t.grado === child.grado);
  const entregas = demoEntregas.filter((e) => e.alumnoId === child.id);

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-10">
      {/* ── Entregables del alumno ────────────────────────────────────── */}
      <section className="space-y-6">
        <PageIntro
          eyebrow={`Alumno · ${child.nombre} · Entregables`}
          title="Entregables del alumno"
          description="Fotos autorizadas, actividades asignadas y entregas privadas del alumno."
        />
        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <PrivatePhotoPlaceholder
                key={photo.id}
                title={photo.alumno}
                description={`${photo.descripcion} · ${photo.grado}`}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground shadow-soft">
            No hay fotos visibles para esta ficha en el demo.
          </div>
        )}
        <PrivacyNote />
      </section>

      {/* ── Tareas y entregas ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Actividades y entregas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Las tareas permiten subir imágenes antes del cierre. Las actividades terminadas en clase no piden entrega.
          </p>
        </div>
        <TareasAlumnoView tareas={tareas} entregas={entregas} alumnoId={child.id} />
      </section>
    </div>
  );
}
