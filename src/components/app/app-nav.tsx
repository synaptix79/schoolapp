'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, FileText, Megaphone, Menu, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { NavItem, RolActivo } from '@/lib/roles';
import { navItemsMap, roleMeta } from '@/lib/roles';
import { cn } from '@/lib/utils';

export function AppNav({ rolActivo }: { rolActivo: RolActivo }) {
  const pathname = usePathname();
  const items = navItemsMap[rolActivo];
  const { navActiveStyle, mobileActiveStyle } = roleMeta[rolActivo];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryPaths: Record<RolActivo, string[]> = {
    direccion: ['/admin', '/admin/grados', '/admin/avisos'],
    docente: ['/profesor', '/profesor/mis-grados', '/profesor/calendario'],
    alumno: ['/alumno/muro', '/alumno/alumno-1/calificaciones', '/alumno/alumno-1/galeria'],
    encargado: ['/padre', '/padre/mis-hijos', '/padre/calendario'],
  };
  const additionalItems: Record<RolActivo, NavItem[]> = {
    direccion: [{ href: '/admin/materias', label: 'Materias', icon: FileText }],
    docente: [{ href: '/profesor/avisos', label: 'Comunicados', icon: Megaphone }],
    alumno: [],
    encargado: [
      { href: '/padre/mis-hijos', label: 'Mis hijos', icon: Users },
      { href: '/padre/asistencia', label: 'Asistencia', icon: ClipboardList },
      { href: '/padre/comunicaciones', label: 'Comunicados', icon: Megaphone },
    ],
  };
  const allMobileItems = [...items, ...additionalItems[rolActivo]];
  const mobileItems = primaryPaths[rolActivo].map((href) => allMobileItems.find((item) => item.href === href)!).map((item) => ({
    ...item,
    label: item.href.endsWith('/calendario') ? 'Agenda' : item.href === '/padre' || item.href === '/alumno/muro' ? 'Inicio' : item.label,
  }));
  const overflowMenuActive = !mobileItems.some((item) => isActivePath(pathname, item.href)) && allMobileItems.some((item) => isActivePath(pathname, item.href));

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, rolActivo]);

  useEffect(() => {
    const closeOnDesktop = () => { if (window.innerWidth >= 1024) setMobileMenuOpen(false); };
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const focused = document.activeElement;
      const editing = focused instanceof HTMLElement && (focused.matches('input, textarea, select') || focused.isContentEditable);
      setKeyboardOpen(Boolean(editing && viewport && window.innerHeight - viewport.height > 120));
    };
    viewport?.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mobileMenuOpen && !dialog.open) dialog.showModal();
    if (!mobileMenuOpen && dialog.open) dialog.close();
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside
        className="hidden w-56 shrink-0 flex-col border-r border-border bg-card lg:flex"
        aria-label="Navegación principal"
      >
        <nav className="flex-1 overflow-y-auto py-3">
          {items.map((item, i) => {
            const active = isActivePath(pathname, item.href);
            return (
              <div
                key={`${rolActivo}-${item.href}`}
                className="animate-nav-slide"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <SidebarItem item={item} active={active} activeStyle={navActiveStyle} />
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────────────── */}
      <nav
        className={cn('fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-panel backdrop-blur lg:hidden', keyboardOpen && 'hidden')}
        aria-label="Navegación principal"
      >
        <div className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-1">
          {mobileItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <div
                key={`${rolActivo}-${item.href}`}
                className="animate-nav-pop min-w-0"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-14',
                    active ? mobileActiveStyle : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden />
                  <span className="w-full text-center">{item.label}</span>
                </Link>
              </div>
            );
          })}
            <button
              ref={menuButtonRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className={cn(
                'animate-nav-pop flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[10px] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-14',
                overflowMenuActive || mobileMenuOpen
                  ? mobileActiveStyle
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              style={{ animationDelay: `${mobileItems.length * 40}ms` }}
            >
              <Menu className="size-[18px]" aria-hidden />
              <span>Menú</span>
            </button>
        </div>
      </nav>

      <dialog
            ref={dialogRef}
            onClose={() => { setMobileMenuOpen(false); menuButtonRef.current?.focus(); }}
            onClick={(event) => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}
            aria-labelledby="mobile-menu-title"
            className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[78dvh] w-full max-w-none overflow-y-auto rounded-t-2xl border-t border-border bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-panel backdrop:bg-canaan-texto/40 lg:hidden"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
            <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Navegación</p>
                <h2 id="mobile-menu-title" className="mt-0.5 text-lg font-bold text-foreground">
                  Todos los menús
                </h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                autoFocus
                onClick={() => setMobileMenuOpen(false)}
                className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="mx-auto mt-4 grid w-full max-w-xl grid-cols-2 gap-2">
              {allMobileItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={`mobile-menu-${rolActivo}-${item.href}`}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? `${mobileActiveStyle} border-primary/25`
                        : 'border-border bg-background text-foreground hover:border-primary/25 hover:bg-muted',
                    )}
                  >
                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', active ? 'bg-card/70' : 'bg-muted')}>
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
      </dialog>
    </>
  );
}

function SidebarItem({ item, active, activeStyle }: { item: NavItem; active: boolean; activeStyle: string }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? activeStyle : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {item.label}
    </Link>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === '/admin' || href === '/profesor' || href === '/padre' || href === '/alumno') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
