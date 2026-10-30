import { NextResponse } from 'next/server';

import { hasSupabaseConfig } from '@/lib/config';
import { getDemoGuardianDashboard } from '@/lib/guardian/demo-data';
import { apiError, loadAuthorizedStudent, requireApiSession } from '@/lib/guardian/server';
import type { AssignedStudent, RelationshipType, StudentDashboard } from '@/lib/guardian/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await params;
  if (!hasSupabaseConfig()) {
    const dashboard = getDemoGuardianDashboard(studentId);
    return dashboard
      ? NextResponse.json(dashboard, { headers: { 'Cache-Control': 'private, no-store' } })
      : apiError(404, 'No se encontró el recurso solicitado.');
  }

  const auth = await requireApiSession(['padre_encargado']);
  if (auth.response) return auth.response;

  const loaded = await loadAuthorizedStudent(auth.session, studentId);
  if (loaded.response) return loaded.response;

  const { supabase, profile } = auth.session;
  const student = loaded.student;
  const [
    linkResult,
    attendanceResult,
    gradesResult,
    assignmentsResult,
    notificationsResult,
    paymentsResult,
    subjectsResult,
  ] = await Promise.all([
    supabase
      .from('guardian_students')
      .select('relationship_type, is_primary')
      .eq('guardian_user_id', profile.id)
      .eq('student_id', student.id)
      .eq('status', 'active')
      .maybeSingle(),
    supabase
      .from('asistencias')
      .select('estado')
      .eq('alumno_id', student.id)
      .order('fecha', { ascending: false })
      .limit(60),
    supabase
      .from('calificaciones')
      .select('nota')
      .eq('alumno_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1),
    student.grado
      ? supabase
          .from('tareas')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', student.school_id)
          .eq('grado', student.grado)
          .gte('vence_at', new Date().toISOString())
      : Promise.resolve({ count: 0, error: null }),
    supabase
      .from('notificaciones')
      .select('id, titulo, mensaje, destino, created_at, leida_at')
      .eq('guardian_user_id', profile.id)
      .eq('alumno_id', student.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('pagos')
      .select('id', { count: 'exact', head: true })
      .eq('alumno_id', student.id)
      .in('estado', ['pendiente', 'vencido']),
    student.grado
      ? supabase
          .from('materias')
          .select('nombre, profesor_id')
          .eq('school_id', student.school_id)
          .eq('grado', student.grado)
          .eq('activo', true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const requiredErrors = [
    linkResult.error,
    attendanceResult.error,
    gradesResult.error,
    assignmentsResult.error,
    notificationsResult.error,
    paymentsResult.error,
    subjectsResult.error,
  ].filter(Boolean);

  if (requiredErrors.length > 0 || !linkResult.data) {
    return apiError(500, 'No se pudo cargar el resumen del alumno.');
  }

  const attendanceRows = attendanceResult.data ?? [];
  const attendancePercentage = attendanceRows.length > 0
    ? Math.round(
        (attendanceRows.filter((row) => row.estado !== 'ausente').length / attendanceRows.length) * 100,
      )
    : null;

  const subjectRows = subjectsResult.data ?? [];
  const teacherIds = [
    ...new Set(
      subjectRows
        .map((subject) => subject.profesor_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const teacherResult = teacherIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, nombre_completo')
        .in('id', teacherIds)
        .eq('activo', true)
    : { data: [], error: null };

  if (teacherResult.error) {
    return apiError(500, 'No se pudo cargar la información de docentes.');
  }

  const teacherNames = new Map(
    (teacherResult.data ?? []).map((teacher) => [teacher.id, teacher.nombre_completo]),
  );
  const relationship = linkResult.data as {
    relationship_type: RelationshipType;
    is_primary: boolean;
  };

  const assignedStudent: AssignedStudent = {
    id: student.id,
    nombre: student.nombre,
    grado: student.grado,
    seccion: student.seccion,
    turno: student.turno,
    avatarUrl: student.avatar_url,
    estado: 'activo',
    relationshipType: relationship.relationship_type,
    isPrimary: relationship.is_primary,
  };

  const payload: StudentDashboard = {
    student: {
      ...assignedStudent,
      fechaNacimiento: student.fecha_nacimiento,
      ci: student.ci,
      tipoSangre: student.tipo_sangre,
      contactoEmergencia: student.contacto_emergencia,
      observacionesMedicas: student.observaciones_medicas,
    },
    summary: {
      attendancePercentage,
      pendingAssignments: assignmentsResult.count ?? 0,
      latestGrade: gradesResult.data?.[0] ? Number(gradesResult.data[0].nota) : null,
      unreadNotifications: (notificationsResult.data ?? []).filter((item) => !item.leida_at).length,
      pendingPayments: paymentsResult.count ?? 0,
    },
    teachers: subjectRows
      .filter((subject) => subject.profesor_id && teacherNames.has(subject.profesor_id))
      .map((subject) => ({
        id: subject.profesor_id!,
        nombre: teacherNames.get(subject.profesor_id!)!,
        materia: subject.nombre,
      })),
    recentNotifications: (notificationsResult.data ?? []).map((item) => ({
      id: item.id,
      titulo: item.titulo,
      mensaje: item.mensaje,
      destino: item.destino,
      createdAt: item.created_at,
    })),
  };

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
