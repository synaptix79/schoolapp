'use client';

import { formatAcademicLabel } from '@/lib/academic-levels';

import { AcademicTabs } from '@/components/app/academic-tabs';
import { CalendarioView } from '@/components/app/calendario-view';
import { PageIntro, PrivacyNote, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { DemoRoleWall } from '@/components/app/social-feed';
import { TareasAlumnoView } from '@/components/app/tareas-view';
import { useGuardianStudent } from '@/lib/guardian/student-context';
import {
  demoActividades,
  demoBoletinSemanal,
  demoCalificaciones,
  demoChildren,
  demoCommuniques,
  demoConfigCalendario,
  demoEntregas,
  demoGallery,
  demoNotasDiarias,
  demoTareas,
} from '@/lib/demo';

export function GuardianWall() {
  const { selectedStudent } = useGuardianStudent();
  if (!selectedStudent) return null;

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <DemoRoleWall
        posts={demoCommuniques}
        childrenList={demoChildren}
        fixedRole="alumno"
        fixedChildId={selectedStudent.id}
        fixedRoleLabel="Padre/Encargado"
      />
    </div>
  );
}

export function GuardianCalendar() {
  const alumno = useSelectedDemoStudent();
  if (!alumno) return null;

  const actividades = demoActividades.filter((item) => !item.grado || item.grado === alumno.grado);
  const config = demoConfigCalendario.filter((item) => !item.grado || item.grado === alumno.grado);

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <PageIntro
        eyebrow="Padre/Encargado · Calendario"
        title="Actividades y eventos"
        description={`Vista de solo lectura con eventos de la comunidad y de ${alumno.nombre}.`}
      />
      <CalendarioView actividades={actividades} config={config} />
    </div>
  );
}

export function GuardianAcademic() {
  const alumno = useSelectedDemoStudent();
  if (!alumno) return null;

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow={`${formatAcademicLabel(alumno.grado)} · Académico`}
        title={alumno.nombre}
        description="Notas diarias, calificaciones, boletín semanal y recordatorios — todo en un lugar."
      />
      <AcademicTabs
        calificaciones={demoCalificaciones.filter((item) => item.alumnoId === alumno.id)}
        notasDiarias={demoNotasDiarias.filter((item) => item.grado === alumno.grado)}
        boletinSemanal={demoBoletinSemanal}
        actividades={demoActividades.filter((item) => !item.grado || item.grado === alumno.grado)}
      />
    </div>
  );
}

export function GuardianDeliverables() {
  const alumno = useSelectedDemoStudent();
  if (!alumno) return null;

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
          eyebrow={`Padre/Encargado · ${alumno.nombre} · Entregables`}
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
            No hay fotos visibles para este alumno.
          </div>
        )}
        <PrivacyNote />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Actividades y entregas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seguimiento de tareas, archivos entregados y correcciones.
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

function useSelectedDemoStudent() {
  const { selectedStudent } = useGuardianStudent();
  return demoChildren.find((child) => child.id === selectedStudent?.id) ?? null;
}
