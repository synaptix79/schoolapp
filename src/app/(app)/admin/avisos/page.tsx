import { ImagePlus, Megaphone, Pin } from 'lucide-react';

import { NoticeCard, PageIntro } from '@/components/app/demo-blocks';
import { demoCommuniques, demoGrades } from '@/lib/demo';

export default function AdminAvisosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · avisos"
        title="Editor con alcance claro para el muro social."
        description="El flujo demo permite elegir categoría, imagen opcional, fijado y alcance: toda la comunidad, un grado o varios grados."
      />

      <section className="grid gap-4 lg:grid-cols-[0.82fr_1fr]">
        <form className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Megaphone className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Nuevo post demo</h2>
              <p className="text-sm text-muted-foreground">Formulario visual, sin persistir.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="h-11 rounded-md border border-input bg-card px-4 text-sm" defaultValue="Olimpiada de Colores" />
              <select className="h-11 rounded-md border border-input bg-card px-4 text-sm" defaultValue="evento">
                <option value="aviso">Aviso</option>
                <option value="noticia">Noticia</option>
                <option value="evento">Evento</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <textarea className="min-h-28 w-full rounded-md border border-input bg-card px-4 py-3 text-sm" defaultValue="La comunidad educativa puede acompañar desde las 08:00. ¡Traé tu color con alegría!" />

            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-foreground">Alcance</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {['Toda la comunidad', 'Un grado', 'Varios grados'].map((label, index) => (
                  <label key={label} className="flex min-h-20 items-start gap-2 rounded-md border border-border p-3 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                    <input name="scope" type="radio" defaultChecked={index === 0} />
                    <span>
                      <span className="block font-bold text-foreground">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {index === 0 ? 'Global' : index === 1 ? 'Ej. 3.º EEB' : 'Multi-select'}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-2 sm:grid-cols-2">
              {demoGrades.slice(1, 5).map((grade) => (
                <label key={`${grade.grado}-${grade.seccion}`} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
                  <input type="checkbox" defaultChecked={grade.grado === '3.º EEB'} />
                  {grade.grado} {grade.seccion}
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              <ImagePlus className="size-4" aria-hidden />
              Subir imagen opcional del post
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
              <input type="checkbox" defaultChecked />
              <Pin className="size-4" aria-hidden />
              Fijar arriba del muro
            </label>

            <button className="h-11 w-full rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste" type="button">
              Publicar post demo
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {demoCommuniques.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
