'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';

import { useRole } from '@/lib/role-context';
import { roleHome, roleMeta } from '@/lib/roles';
import type { RolActivo } from '@/lib/roles';
import { cn } from '@/lib/utils';

const ALL_ROLES: RolActivo[] = ['direccion', 'docente', 'alumno'];

export function RoleSelector() {
  const { rolActivo, setRolActivo } = useRole();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const current = roleMeta[rolActivo];

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  // Cierra con Escape
  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  function handleSelect(rol: RolActivo) {
    setRolActivo(rol);
    setOpen(false);
    router.push(roleHome[rol]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-semibold shadow-soft transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="hidden text-muted-foreground sm:inline">Ver como:</span>
        <span className="text-primary">{current.label}</span>
        <ChevronDown
          className={cn('size-3.5 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Seleccionar perfil de vista"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-card shadow-panel"
        >
          <p className="border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Vista demo por perfil
          </p>

          {ALL_ROLES.map((rol) => {
            const meta = roleMeta[rol];
            const Icon = meta.Icon;
            const active = rol === rolActivo;

            return (
              <button
                key={rol}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(rol)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted',
                  active ? meta.selectorActiveStyle : 'text-foreground'
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{meta.label}</span>
                  <span className="block text-xs leading-5 text-muted-foreground">{meta.description}</span>
                </span>
                {active ? <Check className="size-4 shrink-0 text-current" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
