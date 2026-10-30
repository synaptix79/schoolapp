
import { formatAcademicLabel } from '@/lib/academic-levels';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FileText,
  GraduationCap,
  Megaphone,
  NotebookTabs,
  UserRound
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { DemoTable, PageIntro } from '@/components/app/demo-blocks';
import { demoCalificaciones, demoChildren, demoCommuniques, demoEvents } from '@/lib/demo';
import { cn } from '@/lib/utils';

const alumno = demoChildren[0];
const notas = demoCalificaciones.filter((item) => item.alumnoId === alumno.id);

const reminders = [
  { title: 'Traer cuaderno de Ciencias', detail: 'Actividad de observación de plantas.', tone: 'warning' },
  { title: 'Uniforme de gala', detail: 'Acto cívico del viernes.', tone: 'neutral' },
  { title: 'Leer 15 minutos', detail: 'Registro de lectura semanal.', tone: 'neutral' }
];

const deadlines = [
  { date: 'Lun 29 jun', type: 'Tarea', title: 'Ciencias Naturales', detail: 'Observaciones de una planta del hogar.' },
  { date: 'Mié 1 jul', type: 'Examen', title: 'Matemática', detail: 'Multiplicación y resolución de problemas.' },
  { date: 'Vie 3 jul', type: 'Entrega', title: 'Comunicación', detail: 'Ficha de lectura firmada.' }
];

const weeklyReport = [
  { label: 'Lectura', value: 'Muy buen avance', detail: 'Comprende consignas y participa con seguridad.' },
  { label: 'Convivencia', value: 'Excelente', detail: 'Trabaja bien en equipo y respeta turnos.' },
  { label: 'Foco de mejora', value: 'Practicar tablas', detail: 'Reforzar multiplicación 6, 7 y 8.' }
];

const schedule = [
  { day: 'Lunes', blocks: ['07:30 Formación Cristiana', '08:20 Matemática', '09:30 Ciencias', '10:40 Comunicación'] },
  { day: 'Martes', blocks: ['07:30 Comunicación', '08:20 Guaraní', '09:30 Matemática', '10:40 Arte'] },
  { day: 'Miércoles', blocks: ['07:30 Ciencias', '08:20 Inglés', '09:30 Educación Física', '10:40 Matemática'] },
  { day: 'Jueves', blocks: ['07:30 Comunicación', '08:20 Ciencias Sociales', '09:30 Matemática', '10:40 Música'] },
  { day: 'Viernes', blocks: ['07:30 Acto cívico', '08:20 Formación Cristiana', '09:30 Proyecto de aula', '10:40 Tutoría'] }
];

const usefulInfo = [
  { label: 'Entrada', value: '07:15 a 07:30' },
  { label: 'Salida', value: '11:45' },
  { label: 'Tutoría', value: 'Viernes 10:40' },
  { label: 'Secretaría', value: '+595 981 000 001' }
];

const quickLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/alumno/alumno-1/calificaciones', label: 'Notas completas', icon: FileText },
  { href: '/alumno/calendario', label: 'Calendario', icon: CalendarDays },
  { href: '/alumno/alumno-1/perfil', label: 'Ficha del alumno', icon: UserRound }
];

export default function AlumnoPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Alumno"
        title={`Hola, ${alumno.nombre}.`}
        description={`${formatAcademicLabel(alumno.grado)} · Sección ${alumno.seccion}. Resumen académico, asistencia, fechas importantes y horario semanal.`}
        aside={
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            Año lectivo: <span className="font-semibold text-foreground">{alumno.anioLectivo}</span>
          </div>
        }
      />

      <section className="grid gap-3 md:grid-cols-4">
        <StudentMetric icon={GraduationCap} label="Promedio" value={alumno.promedio} detail="Primer trimestre" />
        <StudentMetric icon={CheckCircle2} label="Presencia" value={alumno.asistencia} detail="Últimos 30 días" />
        <StudentMetric icon={ClipboardList} label="Próxima tarea" value="Lun 29" detail="Ciencias Naturales" />
        <StudentMetric icon={CalendarDays} label="Próximo examen" value="Mié 1" detail="Matemática" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-primary">Boletín semanal</p>
              <h2 className="text-xl font-bold text-foreground">Informe de seguimiento</h2>
            </div>
            <span className="rounded-md bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Semana actual</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {weeklyReport.map((item) => (
              <div key={item.label} className="rounded-md border border-border bg-muted/35 p-3">
                <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-black text-foreground">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="size-5 text-primary" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">Recordatorios</h2>
          </div>
          <div className="space-y-2">
            {reminders.map((item) => (
              <div key={item.title} className={cn('rounded-md border p-3', item.tone === 'warning' ? 'border-canaan-alerta/35 bg-canaan-alerta-suave' : 'border-border bg-muted/35')}>
                <p className="font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <NotebookTabs className="size-5 text-primary" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">Notas recientes</h2>
          </div>
          <DemoTable
            columns={['Materia', 'Periodo', 'Nota', 'Observación']}
            rows={notas.map((item) => [item.materia, item.periodo, <strong key={item.materia}>{item.nota}</strong>, item.observacion])}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">Fechas de exámenes y entregas</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {deadlines.map((item) => (
              <div key={`${item.date}-${item.title}`} className="rounded-md border border-border bg-muted/35 p-3">
                <p className="text-xs font-black text-primary">{item.date}</p>
                <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">{item.type}</p>
                <p className="mt-2 font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <h3 className="text-sm font-black text-foreground">Calendario escolar</h3>
            <div className="mt-3 space-y-2">
              {demoEvents.map((event) => (
                <div key={event.id} className="flex items-start justify-between gap-3 rounded-md bg-muted/35 px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{formatAcademicLabel(event.titulo)}</p>
                    <p className="text-xs leading-5 text-muted-foreground">{event.descripcion}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-card px-2 py-1 text-xs font-bold text-muted-foreground">
                    {event.fecha}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="size-5 text-primary" aria-hidden />
          <h2 className="text-xl font-bold text-foreground">Horario escolar por día</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {schedule.map((day) => (
            <div key={day.day} className="rounded-md border border-border bg-muted/35 p-3">
              <p className="font-black text-foreground">{day.day}</p>
              <div className="mt-3 space-y-2">
                {day.blocks.map((block) => (
                  <div key={block} className="rounded-sm bg-card px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {block}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone className="size-5 text-primary" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">Avisos relevantes</h2>
          </div>
          <div className="space-y-3">
            {demoCommuniques.slice(0, 3).map((notice) => (
              <Link key={notice.id} href={`/aviso/${notice.id}`} className="block rounded-md border border-border bg-muted/35 p-3 transition-colors hover:bg-muted">
                <p className="font-bold text-foreground">{formatAcademicLabel(notice.title)}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{notice.body}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="size-5 text-primary" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">Información útil</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {usefulInfo.map((item) => (
              <div key={item.label} className="rounded-md border border-border bg-muted/35 p-3">
                <p className="text-xs font-bold text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-black text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function StudentMetric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
