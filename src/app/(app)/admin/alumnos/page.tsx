
import { formatAcademicLabel } from '@/lib/academic-levels';
import { ShieldCheck } from 'lucide-react';

import { BulkImporter } from '@/components/app/bulk-importer';
import { DemoTable, PageIntro } from '@/components/app/demo-blocks';
import { demoChildren } from '@/lib/demo';

export default function AdminAlumnosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · alumnos"
        title="Fichas, tutores y consentimiento de imagen."
        description="Aquí se define qué perfiles pueden consultar la información de cada alumno."
      />

      <DemoTable
        columns={['Alumno', 'Grado', 'Tutor', 'Asistencia', 'Fotos']}
        rows={demoChildren.map((child) => [
          child.nombre,
          `${formatAcademicLabel(child.grado)} · ${child.seccion}`,
          child.tutor,
          child.asistencia,
          child.consentimientoFotos ? 'Consentidas' : 'Sin consentimiento'
        ])}
      />

      <section className="rounded-lg border border-primary/20 bg-primary/10 p-5 text-sm leading-6 text-foreground">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <div className="font-semibold">Acceso autorizado por alumno</div>
            <p className="mt-1 text-muted-foreground">
              En la versión final, cada perfil verá únicamente los alumnos autorizados por la institución.
            </p>
          </div>
        </div>
      </section>

      <BulkImporter
        kind="alumnos"
        title="Importar alumnos por Excel o CSV"
        description="Permite actualizar por CI sin duplicar alumnos. Si hay tutor_email, la confirmación deja preparada la invitación o vínculo tutor-alumno en la maqueta."
        roleLabel="Dirección · carga masiva"
        allowedRole="direccion"
      />
    </div>
  );
}
