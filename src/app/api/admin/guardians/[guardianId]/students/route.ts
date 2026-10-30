import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, isUuid, requireApiSession } from '@/lib/guardian/server';
import type { ApiSession } from '@/lib/guardian/server';

const createLinkSchema = z.object({
  studentId: z.string().uuid(),
  relationshipType: z.enum(['Padre', 'Madre', 'Tutor', 'Encargado', 'Abuelo/a', 'Otro']),
  isPrimary: z.boolean().default(false),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guardianId: string }> },
) {
  const auth = await requireApiSession(['admin']);
  if (auth.response) return auth.response;

  const { guardianId } = await params;
  if (!isUuid(guardianId)) return apiError(404, 'No se encontró el recurso solicitado.');

  const guardian = await getGuardian(auth.session, guardianId);
  if (!guardian) return apiError(404, 'No se encontró el recurso solicitado.');

  const { data, error } = await auth.session.supabase
    .from('guardian_students')
    .select(
      'id, student_id, relationship_type, is_primary, status, created_at, updated_at, alumnos!inner(id, nombre, grado, seccion, turno, activo)',
    )
    .eq('guardian_user_id', guardianId)
    .order('created_at');

  if (error) return apiError(500, 'No se pudieron cargar las vinculaciones.');

  return NextResponse.json(
    { guardian, links: data ?? [] },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guardianId: string }> },
) {
  const auth = await requireApiSession(['admin']);
  if (auth.response) return auth.response;

  const { guardianId } = await params;
  if (!isUuid(guardianId)) return apiError(404, 'No se encontró el recurso solicitado.');

  const parsed = createLinkSchema.safeParse(await readJson(request));
  if (!parsed.success) return apiError(400, 'Los datos de la vinculación no son válidos.');

  const { supabase, profile } = auth.session;
  const [guardianResult, studentResult, duplicateResult] = await Promise.all([
    getGuardian(auth.session, guardianId),
    supabase
      .from('alumnos')
      .select('id, school_id, activo')
      .eq('id', parsed.data.studentId)
      .eq('school_id', profile.school_id)
      .maybeSingle(),
    supabase
      .from('guardian_students')
      .select('id')
      .eq('guardian_user_id', guardianId)
      .eq('student_id', parsed.data.studentId)
      .maybeSingle(),
  ]);

  if (!guardianResult || studentResult.error || !studentResult.data) {
    return apiError(404, 'No se encontró el recurso solicitado.');
  }
  if (duplicateResult.data) {
    return apiError(409, 'Esta vinculación ya existe.');
  }

  if (parsed.data.isPrimary) {
    const { error: primaryError } = await supabase
      .from('guardian_students')
      .update({ is_primary: false })
      .eq('student_id', parsed.data.studentId)
      .eq('is_primary', true);
    if (primaryError) return apiError(500, 'No se pudo actualizar el encargado principal.');
  }

  const { data, error } = await supabase
    .from('guardian_students')
    .insert({
      guardian_user_id: guardianId,
      student_id: parsed.data.studentId,
      relationship_type: parsed.data.relationshipType,
      is_primary: parsed.data.isPrimary,
      status: 'active',
    })
    .select('id, student_id, relationship_type, is_primary, status, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') return apiError(409, 'Esta vinculación ya existe.');
    return apiError(400, 'No se pudo crear la vinculación.');
  }

  return NextResponse.json({ link: data }, { status: 201 });
}

async function getGuardian(
  session: ApiSession,
  guardianId: string,
) {
  const { data } = await session.supabase
    .from('profiles')
    .select('id, nombre_completo, activo, school_id, rol')
    .eq('id', guardianId)
    .eq('school_id', session.profile.school_id)
    .eq('rol', 'padre_encargado')
    .maybeSingle();

  return data;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
