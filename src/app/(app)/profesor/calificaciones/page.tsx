import { PageIntro } from '@/components/app/demo-blocks';
import { CargaDocenteTabs } from '@/components/app/carga-docente-tabs';
import { CalendarioView } from '@/components/app/calendario-view';
import { demoActividades, demoConfigCalendario, demoDocentePerfil } from '@/lib/demo';

export default function ProfesorCalificacionesPage() {
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
    <div className="space-y-6">
      <PageIntro
        eyebrow="Docente · centro de carga"
        title="Calificaciones, anotaciones y boletines"
        description="Todo el registro académico en un solo lugar. Seleccioná el grado y la pestaña que necesitás."
      />

      <CargaDocenteTabs />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Calendario académico</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Actividades globales y de los grados asignados al docente. Vista laboral de lunes a viernes.
          </p>
        </div>
        <CalendarioView
          actividades={actividades}
          config={config}
          canCreate
          createGrades={demoDocentePerfil.grados}
          defaultGrado={gradoPrincipal}
        />
      </section>
    </div>
  );
}
