import { CalendarioView } from '@/components/app/calendario-view';
import { PageIntro } from '@/components/app/demo-blocks';
import { demoActividades, demoConfigCalendario, demoGrades } from '@/lib/demo';

export default function AdminCalendarioPage() {
  const grados = [...new Set(
    demoGrades.map((grade) => `${grade.grado} ${grade.seccion}`),
  )];

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <PageIntro
        eyebrow="Dirección · Calendario"
        title="Calendario académico institucional"
        description="Vista general de las actividades de la institución y de todos los grados. Podés crear, editar y organizar tareas, exámenes, eventos y reuniones."
      />

      <CalendarioView
        actividades={demoActividades}
        config={demoConfigCalendario}
        canCreate
        createGrades={grados}
        defaultGrado={grados[0] ?? null}
      />
    </div>
  );
}
