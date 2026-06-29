import { PageIntro } from '@/components/app/demo-blocks';
import { MisGradosAccordion } from '@/components/app/mis-grados-accordion';
import { demoDocentePerfil } from '@/lib/demo';

export default function MisGradosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Docente · mis grados"
        title="Grados asignados"
        description={`${demoDocentePerfil.nombre} · ${demoDocentePerfil.grados.length} grados activos en 2026. Expandí un grado para ver los alumnos.`}
      />
      <MisGradosAccordion />
    </div>
  );
}
