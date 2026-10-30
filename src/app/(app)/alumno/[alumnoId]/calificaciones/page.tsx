import { notFound } from 'next/navigation';

import { AcademicTabs } from '@/components/app/academic-tabs';
import { PageIntro } from '@/components/app/demo-blocks';
import {
  demoActividades,
  demoBoletinSemanal,
  demoCalificaciones,
  demoChildren,
  demoNotasDiarias,
} from '@/lib/demo';

export default async function AlumnoAcademicPage({
  params,
}: {
  params: Promise<{ alumnoId: string }>;
}) {
  const { alumnoId } = await params;
  const alumno = demoChildren.find((child) => child.id === alumnoId);
  if (!alumno) notFound();

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow={`${alumno.grado} · Académico`}
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

