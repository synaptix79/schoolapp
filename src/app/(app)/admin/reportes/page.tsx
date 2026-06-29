import { BarChart3 } from 'lucide-react';

import { DemoTable, MetricCard, PageIntro } from '@/components/app/demo-blocks';
import { demoAdminReports, demoStats } from '@/lib/demo';

export default function AdminReportesPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · reportes"
        title="Control de cargas pendientes."
        description="Esta vista responde al problema de no saber qué docentes todavía no cargaron notas."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {demoStats.map((stat) => (
          <MetricCard key={stat.label} {...stat} icon={BarChart3} />
        ))}
      </section>

      <DemoTable
        columns={['Grado', 'Carga', 'Pendientes', 'Profesor']}
        rows={demoAdminReports.map((item) => [item.grado, item.carga, item.pendientes, item.profesor])}
      />
    </div>
  );
}
