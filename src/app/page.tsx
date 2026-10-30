'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { RolActivo } from '@/lib/roles';

const roleHomes: Record<RolActivo, string> = {
  direccion: '/admin',
  docente: '/profesor',
  alumno: '/alumno/muro',
  encargado: '/padre',
};

// Redirige al inicio del rol activo (leído de localStorage).
// Si no hay rol guardado, va a /admin por defecto.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('canaan-rol') as RolActivo | null;
    const home = stored && stored in roleHomes ? roleHomes[stored] : '/admin';
    router.replace(home);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent" />
    </div>
  );
}
