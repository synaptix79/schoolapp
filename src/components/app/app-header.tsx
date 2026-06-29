import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function AppHeader({
  badge,
  helper,
  name,
  action
}: {
  badge: string;
  helper: string;
  name: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <Link href="/" className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-canaan-primary to-canaan-celeste text-primary-foreground shadow-soft">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-foreground">Canaán Conecta</span>
            <span className="block truncate text-sm text-muted-foreground">Portal escolar para gestión y comunicación</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-soft">
            <span className="font-semibold text-foreground">{name}</span>
            <span className="ml-2 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">{badge}</span>
            <span className="block text-xs text-muted-foreground">{helper}</span>
          </div>
          {action}
        </div>
      </div>
    </header>
  );
}
