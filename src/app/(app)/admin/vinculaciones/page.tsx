import { GuardianLinkManager } from '@/components/admin/guardian-link-manager';
import { PageIntro } from '@/components/app/demo-blocks';

export default function AdminGuardianLinksPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · Vinculaciones"
        title="Padres, encargados y alumnos"
        description="Gestioná qué alumnos puede consultar cada cuenta familiar, el tipo de relación y el encargado principal."
      />
      <GuardianLinkManager />
    </div>
  );
}

