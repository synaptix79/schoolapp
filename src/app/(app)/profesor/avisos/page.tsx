import { NoticeCard, PageIntro } from '@/components/app/demo-blocks';
import { demoCommuniques } from '@/lib/demo';

export default function ProfesorAvisosPage() {
  const teacherNotices = demoCommuniques.filter((notice) => notice.grades.includes('3.º EEB') || notice.scope === 'global');

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Profesor · avisos"
        title="Comunicados para grados asignados."
        description="El profesor solo podrá publicar avisos para sus grados asignados."
      />

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1fr]">
        <form className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="font-semibold text-foreground">Nuevo aviso de grado</h2>
          <p className="mt-1 text-sm text-muted-foreground">Formulario visual, sin persistir.</p>
          <div className="mt-5 space-y-3">
            <input className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm" placeholder="Título" />
            <textarea className="min-h-28 w-full rounded-md border border-input bg-card px-4 py-3 text-sm" placeholder="Mensaje para alumnos" />
            <select className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm">
              <option>3.º EEB A</option>
              <option>1.º EEB B</option>
            </select>
            <button className="h-11 w-full rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste" type="button">
              Publicar aviso demo
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {teacherNotices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
