import { GuardianModuleView } from '@/components/guardian/guardian-module-view';

export default function GuardianCommunicationsPage() {
  return (
    <GuardianModuleView
      module="communications"
      eyebrow="Padre/Encargado · Comunidad"
      title="Comunicados y eventos"
      description="Publicaciones institucionales y del curso de"
      emptyMessage="No hay comunicados disponibles para este alumno."
    />
  );
}

