
import { formatAcademicLabel } from '@/lib/academic-levels';
import { GraduationCap, Phone, Mail, School, BookOpen } from 'lucide-react';

import { PageIntro, PrivatePhotoPlaceholder } from '@/components/app/demo-blocks';
import { demoDocentePerfil, demoGrades } from '@/lib/demo';

export default function ProfesorPerfilPage() {
  const docente = demoDocentePerfil;
  const grades  = demoGrades.filter((g) => g.profesor === docente.nombre);

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <PageIntro
        eyebrow="Docente · Mi Perfil"
        title={docente.nombre}
        description="Datos de contacto y carga académica. Editables en la versión final."
      />

      <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr]">
        {/* Photo */}
        <PrivatePhotoPlaceholder title={docente.nombre} description="Foto de perfil" />

        {/* Contact data */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold text-foreground">Datos de contacto</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <ContactField icon={GraduationCap} label="CI"       value={docente.ci}       />
            <ContactField icon={Phone}          label="Teléfono" value={docente.telefono} />
            <ContactField icon={Mail}           label="Email"    value={docente.email} className="sm:col-span-2" />
          </dl>

          <div className="mt-5">
            <button disabled className="h-10 rounded-lg border border-border bg-muted/40 px-5 text-sm font-semibold text-muted-foreground opacity-60">
              Editar datos (próximamente)
            </button>
          </div>
        </div>
      </div>

      {/* Assigned subjects */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-foreground">Materias asignadas</h2>
        <div className="flex flex-wrap gap-2">
          {docente.materias.map((m) => (
            <span key={m} className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-primary">
              <BookOpen className="size-3.5" aria-hidden />
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Assigned grades */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-base font-bold text-foreground">Grados asignados</h2>
        {grades.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="block w-full text-sm sm:table">
              <thead className="sr-only bg-muted/40 sm:not-sr-only sm:table-header-group">
                <tr>
                  {['Grado', 'Sección', 'Año', 'Alumnos'].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="block divide-y divide-border sm:table-row-group">
                {grades.map((g, i) => (
                  <tr key={i} className="block p-3 transition-colors hover:bg-muted/30 sm:table-row sm:p-0">
                    <td className="block py-1 font-semibold text-foreground sm:table-cell sm:px-4 sm:py-3">
                      <span className="flex items-center gap-2">
                        <School className="size-4 text-primary" aria-hidden />
                        {formatAcademicLabel(g.grado)}
                      </span>
                    </td>
                    <td className="block py-1 text-muted-foreground sm:table-cell sm:px-4 sm:py-3"><span className="sm:hidden">Sección: </span>{g.seccion}</td>
                    <td className="block py-1 text-muted-foreground sm:table-cell sm:px-4 sm:py-3"><span className="sm:hidden">Año: </span>{g.anioLectivo}</td>
                    <td className="block py-1 font-semibold text-foreground sm:table-cell sm:px-4 sm:py-3"><span className="sm:hidden">Alumnos: </span>{g.alumnos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay grados asignados en el demo.</p>
        )}
      </div>
    </div>
  );
}

function ContactField({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3 ${className ?? ''}`}>
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}
