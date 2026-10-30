import { NextResponse } from 'next/server';

import { apiError, requireApiSession } from '@/lib/guardian/server';

export async function GET() {
  const auth = await requireApiSession(['admin']);
  if (auth.response) return auth.response;

  const { supabase, profile } = auth.session;
  const [guardiansResult, studentsResult, linksResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nombre_completo, activo')
      .eq('school_id', profile.school_id)
      .eq('rol', 'padre_encargado')
      .order('nombre_completo'),
    supabase
      .from('alumnos')
      .select('id, nombre, grado, seccion, turno, activo')
      .eq('school_id', profile.school_id)
      .order('nombre'),
    supabase
      .from('guardian_students')
      .select('guardian_user_id, student_id, relationship_type, is_primary, status'),
  ]);

  if (guardiansResult.error || studentsResult.error || linksResult.error) {
    return apiError(500, 'No se pudo cargar el catálogo de vinculaciones.');
  }

  return NextResponse.json(
    {
      guardians: guardiansResult.data ?? [],
      students: studentsResult.data ?? [],
      links: linksResult.data ?? [],
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
