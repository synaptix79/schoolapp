import { NextResponse } from 'next/server';

import { hasSupabaseConfig } from '@/lib/config';
import { demoGuardianStudents } from '@/lib/guardian/demo-data';
import type { AssignedStudent, RelationshipType } from '@/lib/guardian/types';
import { apiError, requireApiSession } from '@/lib/guardian/server';

type GuardianStudentRow = {
  relationship_type: RelationshipType;
  is_primary: boolean;
  alumnos: {
    id: string;
    nombre: string;
    grado: string | null;
    seccion: string | null;
    turno: string | null;
    avatar_url: string | null;
    activo: boolean;
  } | null;
};

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { students: demoGuardianStudents },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const auth = await requireApiSession(['padre_encargado']);
  if (auth.response) return auth.response;

  const { supabase, profile } = auth.session;
  const { data, error } = await supabase
    .from('guardian_students')
    .select(
      'relationship_type, is_primary, alumnos!inner(id, nombre, grado, seccion, turno, avatar_url, activo)',
    )
    .eq('guardian_user_id', profile.id)
    .eq('status', 'active')
    .eq('alumnos.activo', true)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    return apiError(500, 'No se pudieron cargar los alumnos asignados.');
  }

  const students = (data as unknown as GuardianStudentRow[])
    .filter((row) => row.alumnos?.activo)
    .map<AssignedStudent>((row) => ({
      id: row.alumnos!.id,
      nombre: row.alumnos!.nombre,
      grado: row.alumnos!.grado,
      seccion: row.alumnos!.seccion,
      turno: row.alumnos!.turno,
      avatarUrl: row.alumnos!.avatar_url,
      estado: 'activo',
      relationshipType: row.relationship_type,
      isPrimary: row.is_primary,
    }));

  return NextResponse.json(
    { students },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
