import { NextResponse } from 'next/server';

import { apiError, requireApiSession } from '@/lib/guardian/server';

export async function GET() {
  const auth = await requireApiSession(['padre_encargado']);
  if (auth.response) return auth.response;

  const { data, error } = await auth.session.supabase
    .from('notificaciones')
    .select('id, alumno_id, titulo, mensaje, destino, leida_at, created_at, alumnos!inner(nombre)')
    .eq('guardian_user_id', auth.session.profile.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return apiError(500, 'No se pudieron cargar las notificaciones.');

  return NextResponse.json(
    { notifications: data ?? [] },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

