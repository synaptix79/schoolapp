import { GuardianModuleView } from '@/components/guardian/guardian-module-view';

export default function GuardianDocumentsPage() {
  return (
    <GuardianModuleView
      module="documents"
      eyebrow="Padre/Encargado · Documentos"
      title="Documentos del alumno"
      description="Documentos autorizados por la institución para"
      emptyMessage="No hay documentos habilitados para este alumno."
    />
  );
}

