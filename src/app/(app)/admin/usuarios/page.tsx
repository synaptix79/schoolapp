import { UserPlus } from 'lucide-react';

import { DemoTable, PageIntro } from '@/components/app/demo-blocks';
import { demoUsers } from '@/lib/demo';

export default function AdminUsuariosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · usuarios"
        title="Alta y gestión de perfiles."
        description="Pantalla demo para revisar cómo se verán docentes, alumnos y dirección en la versión final."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <DemoTable
          columns={['Nombre', 'Rol', 'Correo', 'Estado']}
          rows={demoUsers.map((user) => [user.nombre, user.rol, user.email, <Status key={user.id} value={user.estado} />])}
        />

        <form className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <UserPlus className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Nuevo usuario demo</h2>
              <p className="text-sm text-muted-foreground">Formulario visual, sin guardar todavía.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <input className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm" placeholder="Nombre completo" />
            <input className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm" placeholder="correo@canaan.edu.py" />
            <select className="h-11 w-full rounded-md border border-input bg-card px-4 text-sm">
              <option>profesor</option>
              <option>alumno</option>
              <option>padre_encargado</option>
              <option>admin</option>
            </select>
            <button className="h-11 w-full rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-canaan-celeste" type="button">
              Crear usuario demo
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Status({ value }: { value: string }) {
  return <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">{value}</span>;
}
