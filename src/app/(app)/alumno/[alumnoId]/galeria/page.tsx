
import { formatAcademicLabel } from '@/lib/academic-levels';
import { notFound } from 'next/navigation';

import { PageIntro, PrivacyNote, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { TareasAlumnoView } from '@/components/app/tareas-view';
import { demoChildren, demoEntregas, demoGallery, demoTareas } from '@/lib/demo';

export default async function AlumnoGaleriaPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>;
}) {
  const { alumnoId } = await params;
  const alumno = demoChildren.find((child) => child.id === alumnoId);
  if (!alumno) notFound();

  const photos = demoGallery.filter(
    (photo) =>
      photo.alumnoId === alumno.id
      && photo.visible
      && photo.consentimiento
      && alumno.consentimientoFotos,
  );

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-10">
      <section className="space-y-6">
        <PageIntro
          eyebrow={`Alumno · ${alumno.nombre} · Entregables`}
          title="Entregables del alumno"
          description="Fotos autorizadas, actividades asignadas y entregas privadas del alumno."
        />
        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <PrivatePhotoPlaceholder
                key={photo.id}
                title={photo.alumno}
                description={`${photo.descripcion} · ${formatAcademicLabel(photo.grado)}`}
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

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Actividades y entregas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Las tareas permiten subir imágenes antes del cierre. Las actividades terminadas en clase no piden entrega.
          </p>
        </div>
        <TareasAlumnoView
          tareas={demoTareas.filter((task) => task.grado === alumno.grado)}
          entregas={demoEntregas.filter((delivery) => delivery.alumnoId === alumno.id)}
          alumnoId={alumno.id}
        />
      </section>
    </div>
  );
}

