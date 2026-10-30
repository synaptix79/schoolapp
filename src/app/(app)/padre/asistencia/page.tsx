import { GuardianModuleView } from '@/components/guardian/guardian-module-view';

export default function GuardianAttendancePage() {
  return (
    <GuardianModuleView
      module="attendance"
      eyebrow="Padre/Encargado · Asistencia"
      title="Asistencia"
      description="Registro de asistencia en modo de solo lectura para"
      emptyMessage="Este alumno todavía no tiene registros de asistencia."
    />
  );
}

