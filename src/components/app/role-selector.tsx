'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';

import { useRole } from '@/lib/role-context';
import { roleHome, roleMeta } from '@/lib/roles';
import type { RolActivo } from '@/lib/roles';
import { cn } from '@/lib/utils';

const ALL_ROLES: RolActivo[] = ['direccion', 'docente', 'alumno', 'encargado'];

export function RoleSelector() {
  const { rolActivo, setRolActivo } = useRole();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8, width: 240, maxHeight: 300 });
  const current = roleMeta[rolActivo];

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
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
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(240, window.innerWidth - 16);
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const useAbove = below < 300 && above > below;
      const maxHeight = Math.max(0, useAbove ? above : below);
      const height = Math.min(menuRef.current?.scrollHeight ?? 300, maxHeight);
      setPosition({ left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)), top: useAbove ? rect.top - 8 - height : rect.bottom + 8, width, maxHeight });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    menuRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open]);

  function handleSelect(rol: RolActivo) {
    setRolActivo(rol);
    setOpen(false);
    router.push(roleHome[rol]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
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

      {open && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Seleccionar perfil de vista"
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const options = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
            const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
            options[next]?.focus();
          }}
          style={{ ...position }}
          className="fixed z-[100] overflow-y-auto rounded-lg border border-border bg-card shadow-panel"
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
        </div>, document.body
      )}
    </div>
  );
}
