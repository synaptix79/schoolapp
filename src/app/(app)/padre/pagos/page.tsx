import { GuardianModuleView } from '@/components/guardian/guardian-module-view';

export default function GuardianPaymentsPage() {
  return (
    <GuardianModuleView
      module="payments"
      eyebrow="Padre/Encargado · Administración"
      title="Cuotas y pagos"
      description="Estado administrativo habilitado para"
      emptyMessage="No hay cuotas o pagos disponibles para este alumno."
    />
  );
}

