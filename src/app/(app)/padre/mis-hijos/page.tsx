import { PageIntro } from '@/components/app/demo-blocks';

export default function MisHijosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Padre/Encargado · alumnos"
        title="Alumnos vinculados"
        description="Usá el selector permanente de la parte superior para alternar entre todos los alumnos asignados a tu cuenta."
      />
    </div>
  );
}
