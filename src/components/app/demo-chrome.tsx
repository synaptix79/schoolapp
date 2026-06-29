'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { AppHeader } from '@/components/app/app-header';
import { AppNav } from '@/components/app/app-nav';
import { RoleSelector } from '@/components/app/role-selector';
import { RoleProvider, useRole } from '@/lib/role-context';
import { allowedPaths, roleHome, roleMeta } from '@/lib/roles';

export function DemoChrome({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <DemoChromeInner>{children}</DemoChromeInner>
    </RoleProvider>
  );
}

function DemoChromeInner({ children }: { children: React.ReactNode }) {
  const { rolActivo, hydrated } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const meta = roleMeta[rolActivo];

  useEffect(() => {
    if (!hydrated) return;
    const allowed = allowedPaths[rolActivo];
    if (!allowed.some((prefix) => pathname.startsWith(prefix))) {
      router.replace(roleHome[rolActivo]);
    }
  }, [rolActivo, pathname, router, hydrated]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader badge={meta.badge} helper="Vista de revisión" name={meta.name} action={<RoleSelector />} />
      <div className="flex min-h-0 flex-1">
        <AppNav rolActivo={rolActivo} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 lg:pb-10 lg:px-8 xl:px-10 2xl:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
