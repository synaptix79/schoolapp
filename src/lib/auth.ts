import { redirect } from 'next/navigation';

import { hasSupabaseConfig } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';

export type Role = 'admin' | 'profesor' | 'padre_encargado' | 'padre';

export type Profile = {
  id: string;
  rol: Role;
  nombre_completo: string;
  telefono: string | null;
  avatar_url: string | null;
  activo: boolean;
  school_id: string;
};

const roleRoutes: Record<Role, string> = {
  admin: '/admin',
  profesor: '/profesor',
  padre_encargado: '/padre',
  padre: '/padre'
};

export function getRoleRoute(role: Role) {
  return roleRoutes[role];
}

export async function getCurrentProfile() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, rol, nombre_completo, telefono, avatar_url, activo, school_id')
    .eq('id', authData.user.id)
    .maybeSingle<Profile>();

  if (profileError || !profile || !profile.activo) {
    return null;
  }

  return profile;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  return profile;
}
