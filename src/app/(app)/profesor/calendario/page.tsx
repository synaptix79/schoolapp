import { CalendarioView } from '@/components/app/calendario-view';
import { PageIntro } from '@/components/app/demo-blocks';
import { demoActividades, demoConfigCalendario, demoDocentePerfil } from '@/lib/demo';

export default function ProfesorCalendarioPage() {
  const gradosAsignados = new Set(demoDocentePerfil.grados);
  const gradosBase = new Set(demoDocentePerfil.grados.map((grado) => grado.replace(/\s+[A-Z]$/, '')));
  const gradoPrincipal = demoDocentePerfil.grados[0] ?? null;
  const actividades = demoActividades.filter((actividad) => {
    if (!actividad.grado) return true;
    return gradosAsignados.has(actividad.grado) || gradosBase.has(actividad.grado);
  });
  const config = demoConfigCalendario.filter((item) => {
    if (!item.grado) return true;
    return gradosAsignados.has(item.grado) || gradosBase.has(item.grado);
  });

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <PageIntro
        eyebrow="Docente · Calendario"
        title="Calendario académico"
        description="Actividades globales y de tus grados asignados. Podés crear, editar y organizar tareas, exámenes, eventos y reuniones."
      />

      <CalendarioView
        actividades={actividades}
        config={config}
        canCreate
        createGrades={demoDocentePerfil.grados}
        defaultGrado={gradoPrincipal}
      />
    </div>
  );
}
