'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import type { RolActivo } from './roles';

interface RoleContextValue {
  rolActivo: RolActivo;
  setRolActivo: (rol: RolActivo) => void;
  hydrated: boolean;
}

const STORAGE_KEY = 'canaan-rol';
const VALID_ROLES: RolActivo[] = ['direccion', 'docente', 'alumno', 'encargado'];

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [rolActivo, setRolActivoState] = useState<RolActivo>('direccion');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored = localStorage.getItem(STORAGE_KEY) as RolActivo | null;
    // Migrar valor antiguo 'familia' → 'alumno'
    if ((stored as string) === 'familia') stored = 'alumno';
    if (stored && VALID_ROLES.includes(stored)) setRolActivoState(stored);
    setHydrated(true);
  }, []);

  function setRolActivo(rol: RolActivo) {
    setRolActivoState(rol);
    localStorage.setItem(STORAGE_KEY, rol);
  }

  return <RoleContext.Provider value={{ rolActivo, setRolActivo, hydrated }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole debe usarse dentro de RoleProvider');
  return ctx;
}
