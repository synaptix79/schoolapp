'use client';

import { formatAcademicLabel } from '@/lib/academic-levels';

import Link from 'next/link';
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';

import { useGuardianStudent } from '@/lib/guardian/student-context';
import type { StudentDashboard } from '@/lib/guardian/types';
import { useStudentResource } from '@/lib/guardian/use-student-resource';

export function GuardianDashboard() {
  const { selectedStudent } = useGuardianStudent();
  const { data, isLoading, error, reload } = useStudentResource<StudentDashboard>('dashboard');

  if (!selectedStudent) return null;

  if (isLoading) {
    return <LoadingState message={`Cargando información de ${selectedStudent.nombre}…`} />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'No se pudo cargar el resumen.'} onRetry={() => void reload()} />;
  }

  const summaryCards = [
    {
      label: 'Asistencia',
      value: data.summary.attendancePercentage === null ? 'Sin datos' : `${data.summary.attendancePercentage}%`,
      icon: CalendarCheck,
      href: '/padre/asistencia',
    },
    {
      label: 'Última calificación',
      value: data.summary.latestGrade === null ? 'Sin datos' : String(data.summary.latestGrade),
      icon: BookOpen,
      href: '/padre/academico',
    },
    {
      label: 'Tareas pendientes',
      value: String(data.summary.pendingAssignments),
      icon: ClipboardList,
      href: '/padre/agenda',
    },
    {
      label: 'Pagos pendientes',
      value: String(data.summary.pendingPayments),
      icon: CreditCard,
      href: '/padre/pagos',
    },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <p className="text-sm font-bold text-primary">Panel del padre o encargado</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Información de {data.student.nombre}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[data.student.grado ? formatAcademicLabel(data.student.grado) : null, data.student.seccion, data.student.turno ? `Turno ${data.student.turno}` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-primary/40">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" aria-hidden />
            <h2 className="text-lg font-bold text-foreground">Docentes asociados</h2>
          </div>
          {data.teachers.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {data.teachers.map((teacher) => (
                <li key={`${teacher.id}-${teacher.materia}`} className="flex items-center justify-between gap-3 py-3">
                  <span className="font-semibold text-foreground">{teacher.nombre}</span>
                  <span className="text-sm text-muted-foreground">{teacher.materia}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyModule message="Todavía no hay docentes asociados al curso." />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="size-5 text-primary" aria-hidden />
              <h2 className="text-lg font-bold text-foreground">Notificaciones</h2>
            </div>
            {data.summary.unreadNotifications > 0 ? (
              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                {data.summary.unreadNotifications} nuevas
              </span>
            ) : null}
          </div>
          {data.recentNotifications.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {data.recentNotifications.map((notification) => (
                <li key={notification.id} className="rounded-lg border border-border bg-muted/35 p-3">
                  <p className="font-semibold text-foreground">{notification.titulo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.student.nombre}: {notification.mensaje}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyModule message="No hay notificaciones para este alumno." />
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/padre/comunicaciones" label="Comunicados" icon={Bell} />
        <QuickLink href="/padre/documentos" label="Documentos" icon={FileText} />
        <QuickLink href="/padre/perfil" label="Datos personales" icon={Users} />
        <QuickLink href="/padre/agenda" label="Horario y tareas" icon={ClipboardList} />
      </section>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof FileText }) {
  return (
    <Link href={href} className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-card px-4 font-semibold text-foreground transition-colors hover:bg-muted">
      <Icon className="size-4 text-primary" aria-hidden />
      {label}
    </Link>
  );
}

export function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-sm font-semibold text-muted-foreground">
      <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-canaan-alerta/30 bg-canaan-alerta-suave/60 p-5">
      <p className="font-semibold text-canaan-alerta">No se pudo mostrar la información</p>
      <p className="mt-1 text-sm text-foreground">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold">
        <RefreshCw className="size-4" aria-hidden />
        Reintentar
      </button>
    </div>
  );
}

export function EmptyModule({ message }: { message: string }) {
  return <p className="mt-4 rounded-lg bg-muted/45 p-4 text-sm text-muted-foreground">{message}</p>;
}

