'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { NavItem, RolActivo } from '@/lib/roles';
import { navItemsMap, roleMeta } from '@/lib/roles';
import { cn } from '@/lib/utils';

export function AppNav({ rolActivo }: { rolActivo: RolActivo }) {
  const pathname = usePathname();
  const items = navItemsMap[rolActivo];
  const { navActiveStyle, mobileActiveStyle } = roleMeta[rolActivo];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasOverflowMenu = items.length > 5;
  const mobileItems = hasOverflowMenu ? items.slice(0, 4) : items;
  const overflowMenuActive = hasOverflowMenu && items.slice(4).some((item) => isActivePath(pathname, item.href));

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, rolActivo]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
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
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-panel backdrop-blur lg:hidden"
        aria-label="Navegación principal"
      >
        <div className={cn('mx-auto grid w-full max-w-3xl gap-1', hasOverflowMenu || mobileItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4')}>
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
          {hasOverflowMenu ? (
            <button
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
          ) : null}
        </div>
      </nav>

      {hasOverflowMenu && mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar todos los menús"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-canaan-texto/40 backdrop-blur-[2px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-panel"
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
              {items.map((item) => {
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
          </section>
        </div>
      ) : null}
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
