import { CalendarioView } from '@/components/app/calendario-view';
import { PageIntro } from '@/components/app/demo-blocks';
import { demoActividades, demoChildren, demoConfigCalendario } from '@/lib/demo';

export default function AlumnoCalendarioPage() {
  const alumno = demoChildren[0];
  const actividades = demoActividades.filter((actividad) => !actividad.grado || actividad.grado === alumno.grado);
  const config = demoConfigCalendario.filter((item) => !item.grado || item.grado === alumno.grado);

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <PageIntro
        eyebrow="Alumno · Calendario"
        title="Actividades y eventos"
        description="Vista de solo lectura con eventos de la comunidad y del grado del alumno."
      />
      <CalendarioView actividades={actividades} config={config} />
    </div>
  );
}

