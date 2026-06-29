'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import type { NavItem, RolActivo } from '@/lib/roles';
import { navItemsMap, roleMeta } from '@/lib/roles';
import { cn } from '@/lib/utils';

export function AppNav({ rolActivo }: { rolActivo: RolActivo }) {
  const pathname = usePathname();
  const items = navItemsMap[rolActivo];
  const { navActiveStyle, mobileActiveStyle } = roleMeta[rolActivo];
  const mobileItems = items.slice(0, 5);

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
              <motion.div
                key={`${rolActivo}-${item.href}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.14, delay: i * 0.04, ease: 'easeOut' }}
              >
                <SidebarItem item={item} active={active} activeStyle={navActiveStyle} />
              </motion.div>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile bottom bar ─────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-panel backdrop-blur lg:hidden"
        aria-label="Navegación principal"
      >
        <div className={cn('grid gap-1', mobileItems.length <= 4 ? 'grid-cols-4' : 'grid-cols-5')}>
          {mobileItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <motion.div
                key={`${rolActivo}-${item.href}`}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.12, delay: i * 0.04, ease: 'easeOut' }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold transition-colors',
                    active ? mobileActiveStyle : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="w-full truncate text-center">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>
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
  if (href === '/admin' || href === '/profesor' || href === '/padre') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
