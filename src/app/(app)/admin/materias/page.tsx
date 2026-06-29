import { DemoTable, PageIntro } from '@/components/app/demo-blocks';
import { demoSubjects } from '@/lib/demo';

export default function AdminMateriasPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · materias"
        title="Materias preparadas para carga estructurada."
        description="Estas materias alimentan la tabla editable de calificaciones del profesor y la vista de solo lectura del alumno."
      />

      <DemoTable
        columns={['Materia', 'Nivel', 'Responsable', 'Estado']}
        rows={demoSubjects.map((subject) => [subject.nombre, subject.nivel, subject.profesor, subject.estado])}
      />
    </div>
  );
}
