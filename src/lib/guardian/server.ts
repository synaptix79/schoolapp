import { NextResponse } from 'next/server';

import type { Profile, Role } from '@/lib/auth';
import { hasSupabaseConfig } from '@/lib/config';
import type { GuardianAccessStatus } from '@/lib/guardian/access';
import { createClient } from '@/lib/supabase/server';

export type ApiSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
};

type ApiSessionResult =
  | { session: ApiSession; response?: never }
  | { session?: never; response: NextResponse };

export async function requireApiSession(allowedRoles: Role[]): Promise<ApiSessionResult> {
  if (!hasSupabaseConfig()) {
    return {
      response: apiError(503, 'El servicio de datos todavía no está configurado.'),
    };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { response: apiError(401, 'La sesión no es válida o expiró.') };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, rol, nombre_completo, telefono, avatar_url, activo, school_id')
    .eq('id', authData.user.id)
    .maybeSingle();

  const profile = data as Profile | null;

  if (error || !profile || !profile.activo) {
    return { response: apiError(403, 'No tenés autorización para realizar esta operación.') };
  }

  if (!allowedRoles.includes(profile.rol)) {
    return { response: apiError(403, 'No tenés autorización para realizar esta operación.') };
  }

  return { session: { supabase, profile } };
}

export async function authorizeGuardianStudent(
  session: ApiSession,
  studentId: string,
): Promise<NextResponse | null> {
  if (!isUuid(studentId)) {
    return apiError(404, 'No se encontró el recurso solicitado.');
  }

  const { data, error } = await session.supabase.rpc('authorize_guardian_student', {
    p_student_id: studentId,
  });

  if (error) {
    return apiError(403, 'No tenés autorización para consultar este alumno.');
  }

  const status = data as GuardianAccessStatus;
  if (status === 'allowed') return null;
  if (status === 'not_found') return apiError(404, 'No se encontró el recurso solicitado.');
  return apiError(403, 'No tenés autorización para consultar este alumno.');
}

export type AuthorizedStudent = {
  id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  grado: string | null;
  seccion: string | null;
  turno: string | null;
  ci: string | null;
  tipo_sangre: string | null;
  contacto_emergencia: string | null;
  observaciones_medicas: string | null;
  avatar_url: string | null;
  activo: boolean;
  school_id: string;
};

export async function loadAuthorizedStudent(
  session: ApiSession,
  studentId: string,
): Promise<
  | { student: AuthorizedStudent; response?: never }
  | { student?: never; response: NextResponse }
> {
  const authorizationResponse = await authorizeGuardianStudent(session, studentId);
  if (authorizationResponse) return { response: authorizationResponse };

  const { data, error } = await session.supabase
    .from('alumnos')
    .select(
      'id, nombre, fecha_nacimiento, grado, seccion, turno, ci, tipo_sangre, contacto_emergencia, observaciones_medicas, avatar_url, activo, school_id',
    )
    .eq('id', studentId)
    .eq('activo', true)
    .maybeSingle();

  if (error || !data) {
    return { response: apiError(404, 'No se encontró el recurso solicitado.') };
  }

  return { student: data as AuthorizedStudent };
}

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
