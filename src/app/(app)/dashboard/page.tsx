import { redirect } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileImage,
  FileText,
  GraduationCap,
  Megaphone,
  School,
  UserPlus,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { PageIntro, QuickLink } from '@/components/app/demo-blocks';
import { hasSupabaseConfig } from '@/lib/config';
import { getRoleRoute, requireProfile } from '@/lib/auth';

const demoSections: Array<{
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
  modules: Array<{ href: string; label: string; description: string; icon: LucideIcon }>;
}> = [
  {
    eyebrow: 'Dirección',
    title: 'Gestión institucional',
    description: 'Funciones para administrar usuarios, alumnos, grados, avisos y reportes generales.',
    accent: 'border-primary/20 bg-primary/5',
    modules: [
      { href: '/admin/usuarios', label: 'Usuarios y permisos', description: 'Alta y revisión de perfiles activos.', icon: UserPlus },
      { href: '/admin/alumnos', label: 'Alumnos', description: 'Fichas, tutores y consentimiento de imagen.', icon: Users },
      { href: '/admin/grados', label: 'Grados y secciones', description: 'Asignación de docentes por curso.', icon: School },
      { href: '/admin/reportes', label: 'Reportes', description: 'Cargas pendientes, asistencia y estado académico.', icon: FileText }
    ]
  },
  {
    eyebrow: 'Docentes',
    title: 'Operación de aula',
    description: 'Herramientas para seguimiento diario de cursos asignados.',
    accent: 'border-canaan-celeste/20 bg-canaan-celeste/5',
    modules: [
      { href: '/profesor/asistencia', label: 'Llamar asistencia', description: 'Registro opcional del día actual, solo si se necesita.', icon: ClipboardCheck },
      { href: '/profesor/calificaciones', label: 'Cargar notas', description: 'Notas por alumno, materia y periodo.', icon: ClipboardList },
      { href: '/profesor/galeria', label: 'Entregables', description: 'Fotos de tareas y evidencias por alumno.', icon: FileImage },
      { href: '/profesor/avisos', label: 'Avisos de curso', description: 'Comunicados para grados asignados.', icon: Megaphone }
    ]
  },
  {
    eyebrow: 'Alumno',
    title: 'Seguimiento académico',
    description: 'Vista de consulta con información útil para el alumno o su responsable.',
    accent: 'border-canaan-celeste/25 bg-canaan-celeste-suave/70',
    modules: [
      { href: '/alumno', label: 'Resumen del alumno', description: 'Notas, presencia, boletín semanal y recordatorios.', icon: GraduationCap },
      { href: '/padre/calendario', label: 'Calendario', description: 'Eventos globales y por grado.', icon: CalendarDays },
      { href: '/padre/alumno-1/calificaciones', label: 'Notas completas', description: 'Historial académico de solo lectura.', icon: FileText },
      { href: '/padre/alumno-1/galeria', label: 'Entregables', description: 'Tareas, fotos y evidencias autorizadas.', icon: FileImage }
    ]
  }
];

const reviewItems = [
  { label: 'Comunicados', value: 'Publicación por alcance', icon: Bell },
  { label: 'Asistencia', value: 'Bajo demanda', icon: ClipboardCheck },
  { label: 'Boletines', value: 'Seguimiento semanal', icon: FileText }
];

export default async function DashboardPage() {
  if (!hasSupabaseConfig()) {
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-5">
        <PageIntro
          eyebrow="Demo funcional"
          title="Recorrido de módulos por rol."
          description="Esta página no repite el muro. Reúne las funciones operativas que se revisan en la presentación: dirección, docentes y alumno."
          aside={
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              Estado: <span className="font-semibold text-foreground">versión final de revisión</span>
            </div>
          }
        />

        <section className="grid gap-3 md:grid-cols-3">
          {reviewItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-lg border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-xl font-black text-foreground">{item.value}</p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <div className="space-y-4">
          {demoSections.map((section) => (
            <section key={section.title} className={`rounded-lg border p-4 shadow-soft sm:p-5 ${section.accent}`}>
              <div className="mb-4 max-w-3xl">
                <p className="text-sm font-black text-primary">{section.eyebrow}</p>
                <h2 className="text-2xl font-black leading-tight text-foreground">{section.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.description}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {section.modules.map((item) => (
                  <QuickLink key={item.href} {...item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  const profile = await requireProfile();
  redirect(getRoleRoute(profile.rol));
}
