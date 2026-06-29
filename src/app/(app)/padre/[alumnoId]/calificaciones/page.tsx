import { notFound } from 'next/navigation';

import { AcademicTabs } from '@/components/app/academic-tabs';
import { PageIntro } from '@/components/app/demo-blocks';
import { demoActividades, demoBoletinSemanal, demoCalificaciones, demoChildren, demoNotasDiarias } from '@/lib/demo';

export default async function AcademicPage({ params }: { params: Promise<{ alumnoId: string }> }) {
  const { alumnoId } = await params;
  const child = demoChildren.find((c) => c.id === alumnoId);

  if (!child) notFound();

  const calificaciones = demoCalificaciones.filter((c) => c.alumnoId === child.id);
  const notasDiarias   = demoNotasDiarias.filter((n) => n.grado === child.grado);
  const actividades    = demoActividades.filter((a) => !a.grado || a.grado === child.grado);

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow={`${child.grado} · Académico`}
        title={child.nombre}
        description="Notas diarias, calificaciones, boletín semanal y recordatorios — todo en un lugar."
      />

      <AcademicTabs
        calificaciones={calificaciones}
        notasDiarias={notasDiarias}
        boletinSemanal={demoBoletinSemanal}
        actividades={actividades}
      />
    </div>
  );
}
