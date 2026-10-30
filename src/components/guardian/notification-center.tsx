'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

import { useGuardianStudent } from '@/lib/guardian/student-context';

type GuardianNotification = {
  id: string;
  alumno_id: string;
  titulo: string;
  mensaje: string;
  destino: string | null;
  leida_at: string | null;
  created_at: string;
  alumnos: { nombre: string } | null;
};

export function GuardianNotificationCenter() {
  const router = useRouter();
  const { assignedStudents, selectStudent, isLoading, error } = useGuardianStudent();
  const [notifications, setNotifications] = useState<GuardianNotification[]>([]);

  useEffect(() => {
    if (isLoading || error || assignedStudents.length === 0) {
      setNotifications([]);
      return;
    }

    const controller = new AbortController();
    void fetch('/api/guardian/notifications', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return { notifications: [] };
        return response.json() as Promise<{ notifications: GuardianNotification[] }>;
      })
      .then((payload) => setNotifications(payload.notifications ?? []))
      .catch((requestError) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
          setNotifications([]);
        }
      });

    return () => controller.abort();
  }, [assignedStudents, error, isLoading]);

  if (notifications.length === 0) return null;

  const unread = notifications.filter((notification) => !notification.leida_at).length;

  function openNotification(notification: GuardianNotification) {
    if (!assignedStudents.some((student) => student.id === notification.alumno_id)) return;
    selectStudent(notification.alumno_id);
    const destination = notification.destino?.startsWith('/padre')
      ? notification.destino
      : '/padre';
    router.push(destination);
  }

  return (
    <details className="group rounded-xl border border-border bg-card shadow-soft">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <Bell className="size-4 text-primary" aria-hidden />
          Notificaciones de tus alumnos
        </span>
        {unread > 0 ? (
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{unread}</span>
        ) : null}
      </summary>
      <div className="border-t border-border p-2">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => openNotification(notification)}
            className="flex w-full flex-col rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted"
          >
            <span className="font-semibold text-foreground">{notification.titulo}</span>
            <span className="mt-1 text-sm text-muted-foreground">
              {notification.alumnos?.nombre ?? 'Alumno'}: {notification.mensaje}
            </span>
          </button>
        ))}
      </div>
    </details>
  );
}

