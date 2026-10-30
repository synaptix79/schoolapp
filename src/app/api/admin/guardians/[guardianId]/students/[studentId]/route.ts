import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, isUuid, requireApiSession } from '@/lib/guardian/server';

const updateLinkSchema = z
  .object({
    relationshipType: z.enum(['Padre', 'Madre', 'Tutor', 'Encargado', 'Abuelo/a', 'Otro']).optional(),
    isPrimary: z.boolean().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ guardianId: string; studentId: string }> },
) {
  const auth = await requireApiSession(['admin']);
  if (auth.response) return auth.response;

  const { guardianId, studentId } = await params;
  if (!isUuid(guardianId) || !isUuid(studentId)) {
    return apiError(404, 'No se encontró el recurso solicitado.');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'Los datos de la vinculación no son válidos.');
  }
  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) return apiError(400, 'Los datos de la vinculación no son válidos.');

  const { supabase } = auth.session;
  const existing = await supabase
    .from('guardian_students')
    .select('id')
    .eq('guardian_user_id', guardianId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing.error || !existing.data) {
    return apiError(404, 'No se encontró el recurso solicitado.');
  }

  if (parsed.data.isPrimary) {
    const { error: primaryError } = await supabase
      .from('guardian_students')
      .update({ is_primary: false })
      .eq('student_id', studentId)
      .eq('is_primary', true);
    if (primaryError) return apiError(500, 'No se pudo actualizar el encargado principal.');
  }

  const updatePayload = {
    ...(parsed.data.relationshipType ? { relationship_type: parsed.data.relationshipType } : {}),
    ...(typeof parsed.data.isPrimary === 'boolean' ? { is_primary: parsed.data.isPrimary } : {}),
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.status === 'inactive' ? { is_primary: false } : {}),
  };

  const { data, error } = await supabase
    .from('guardian_students')
    .update(updatePayload)
    .eq('id', existing.data.id)
    .select('id, student_id, relationship_type, is_primary, status, created_at, updated_at')
    .single();

  if (error) return apiError(400, 'No se pudo actualizar la vinculación.');
  return NextResponse.json({ link: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ guardianId: string; studentId: string }> },
) {
  const auth = await requireApiSession(['admin']);
  if (auth.response) return auth.response;

  const { guardianId, studentId } = await params;
  if (!isUuid(guardianId) || !isUuid(studentId)) {
    return apiError(404, 'No se encontró el recurso solicitado.');
  }

  const { error, count } = await auth.session.supabase
    .from('guardian_students')
    .delete({ count: 'exact' })
    .eq('guardian_user_id', guardianId)
    .eq('student_id', studentId);

  if (error) return apiError(400, 'No se pudo eliminar la vinculación.');
  if (!count) return apiError(404, 'No se encontró el recurso solicitado.');

  return new NextResponse(null, { status: 204 });
}

