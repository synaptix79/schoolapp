import { AppHeader } from '@/components/app/app-header';
import { AppNav } from '@/components/app/app-nav';
import { DemoChrome } from '@/components/app/demo-chrome';
import { LogoutButton } from '@/components/auth/logout-button';
import { hasSupabaseConfig } from '@/lib/config';
import { requireProfile } from '@/lib/auth';
import type { RolActivo } from '@/lib/roles';

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasSupabaseConfig()) {
    return <DemoChrome>{children}</DemoChrome>;
  }

  const profile = await requireProfile();

  const rolMap: Record<string, RolActivo> = {
    admin: 'direccion',
    profesor: 'docente',
    padre_encargado: 'encargado',
    padre: 'encargado',
  };
  const rolActivo: RolActivo = rolMap[profile.rol] ?? 'direccion';

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader badge={roleLabel[profile.rol]} helper="Sesión activa" name={profile.nombre_completo} action={<LogoutButton />} />
      <div className="flex min-h-0 flex-1">
        <AppNav rolActivo={rolActivo} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:pb-10 lg:px-8 xl:px-10 2xl:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const roleLabel: Record<string, string> = {
  admin: 'Dirección',
  profesor: 'Docente',
  padre_encargado: 'Padre/Encargado',
  padre: 'Padre/Encargado',
};
