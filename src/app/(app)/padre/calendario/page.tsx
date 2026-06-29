import { CalendarioView } from '@/components/app/calendario-view';
import { PageIntro } from '@/components/app/demo-blocks';
import { demoActividades, demoChildren, demoConfigCalendario } from '@/lib/demo';

export default function PadreCalendarioPage() {
  const child      = demoChildren[0];
  const actividades = demoActividades.filter((a) => !a.grado || a.grado === child.grado);
  const config = demoConfigCalendario.filter((item) => !item.grado || item.grado === child.grado);

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <PageIntro
        eyebrow="Alumno · Calendario"
        title="Actividades y eventos"
        description="Vista de solo lectura. Eventos de la comunidad y del grado de tus hijos."
      />

      <CalendarioView actividades={actividades} config={config} />
    </div>
  );
}
