import { PageIntro } from '@/components/app/demo-blocks';
import { CargaDocenteTabs } from '@/components/app/carga-docente-tabs';

export default function ProfesorCalificacionesPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Docente · centro de carga"
        title="Calificaciones, anotaciones y boletines"
        description="Todo el registro académico en un solo lugar. Seleccioná el grado y la pestaña que necesitás."
      />

      <CargaDocenteTabs />
    </div>
  );
}
