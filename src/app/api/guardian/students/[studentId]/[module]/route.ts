import { NextResponse } from 'next/server';

import { hasSupabaseConfig } from '@/lib/config';
import { getDemoGuardianModule } from '@/lib/guardian/demo-data';
import { apiError, loadAuthorizedStudent, requireApiSession } from '@/lib/guardian/server';
import type { GuardianModule } from '@/lib/guardian/types';

const VALID_MODULES = new Set<GuardianModule>([
  'attendance',
  'grades',
  'subjects',
  'schedule',
  'assignments',
  'communications',
  'payments',
  'documents',
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string; module: string }> },
) {
  const { studentId, module: requestedModule } = await params;
  if (!VALID_MODULES.has(requestedModule as GuardianModule)) {
    return apiError(404, 'No se encontró el recurso solicitado.');
  }

  if (!hasSupabaseConfig()) {
    const payload = getDemoGuardianModule(studentId, requestedModule as GuardianModule);
    return payload
      ? NextResponse.json(payload, { headers: { 'Cache-Control': 'private, no-store' } })
      : apiError(404, 'No se encontró el recurso solicitado.');
  }

  const auth = await requireApiSession(['padre_encargado']);
  if (auth.response) return auth.response;

  const loaded = await loadAuthorizedStudent(auth.session, studentId);
  if (loaded.response) return loaded.response;

  const guardianModule = requestedModule as GuardianModule;
  const { supabase } = auth.session;
  const student = loaded.student;

  try {
    let items: Array<Record<string, unknown>>;

    switch (guardianModule) {
      case 'attendance': {
        const { data, error } = await supabase
          .from('asistencias')
          .select('id, fecha, estado, observacion')
          .eq('alumno_id', student.id)
          .order('fecha', { ascending: false });
        if (error) throw error;
        items = data ?? [];
        break;
      }
      case 'grades': {
        const [grades, annotations, dailyNotes] = await Promise.all([
          supabase
            .from('calificaciones')
            .select('id, materia, periodo, nota, observacion, created_at')
            .eq('alumno_id', student.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('anotaciones_diarias')
            .select('id, materia, texto, tipo, fecha')
            .eq('alumno_id', student.id)
            .eq('estado', 'completada')
            .order('fecha', { ascending: false }),
          supabase
            .from('notas_diarias')
            .select('id, materia, texto, tipo, fecha')
            .eq('alumno_id', student.id)
            .order('fecha', { ascending: false }),
        ]);
        if (grades.error || annotations.error || dailyNotes.error) {
          throw grades.error ?? annotations.error ?? dailyNotes.error;
        }
        items = [
          ...(grades.data ?? []).map((item) => ({ ...item, recordType: 'calificacion' })),
          ...(annotations.data ?? []).map((item) => ({ ...item, recordType: 'anotacion' })),
          ...(dailyNotes.data ?? []).map((item) => ({ ...item, recordType: 'nota_diaria' })),
        ];
        break;
      }
      case 'subjects': {
        if (!student.grado) {
          items = [];
          break;
        }
        const { data, error } = await supabase
          .from('materias')
          .select('id, nombre, profesor_id')
          .eq('school_id', student.school_id)
          .eq('grado', student.grado)
          .eq('activo', true)
          .order('nombre');
        if (error) throw error;
        items = data ?? [];
        break;
      }
      case 'schedule': {
        if (!student.grado) {
          items = [];
          break;
        }
        let query = supabase
          .from('horarios')
          .select('id, dia_semana, hora_inicio, hora_fin, aula, materia_id, grado, seccion, turno')
          .eq('school_id', student.school_id)
          .eq('grado', student.grado)
          .order('dia_semana')
          .order('hora_inicio');
        if (student.seccion) query = query.eq('seccion', student.seccion);
        const { data, error } = await query;
        if (error) throw error;
        items = data ?? [];
        break;
      }
      case 'assignments': {
        if (!student.grado) {
          items = [];
          break;
        }
        const { data: tasks, error: tasksError } = await supabase
          .from('tareas')
          .select('id, materia, titulo, consigna, asignada_at, vence_at')
          .eq('school_id', student.school_id)
          .eq('grado', student.grado)
          .order('vence_at', { ascending: false });
        if (tasksError) throw tasksError;

        const taskIds = (tasks ?? []).map((task) => task.id);
        const deliveries = taskIds.length > 0
          ? await supabase
              .from('entregas')
              .select('tarea_id, estado, entregado_at, corregido_at, nota_correccion')
              .eq('alumno_id', student.id)
              .in('tarea_id', taskIds)
          : { data: [], error: null };
        if (deliveries.error) throw deliveries.error;

        const deliveryByTask = new Map(
          (deliveries.data ?? []).map((delivery) => [delivery.tarea_id, delivery]),
        );
        items = (tasks ?? []).map((task) => ({
          ...task,
          entrega: deliveryByTask.get(task.id) ?? null,
        }));
        break;
      }
      case 'communications': {
        if (!student.grado) {
          items = [];
          break;
        }
        const { data, error } = await supabase
          .from('comunicados')
          .select('id, titulo, contenido, grado, publicado_at')
          .eq('school_id', student.school_id)
          .eq('activo', true)
          .or(`grado.is.null,grado.eq.${escapePostgrestValue(student.grado)}`)
          .order('publicado_at', { ascending: false });
        if (error) throw error;
        items = data ?? [];
        break;
      }
      case 'payments': {
        const { data, error } = await supabase
          .from('pagos')
          .select('id, concepto, monto, moneda, vencimiento, estado, pagado_at')
          .eq('alumno_id', student.id)
          .order('vencimiento', { ascending: false });
        if (error) throw error;
        items = data ?? [];
        break;
      }
      case 'documents': {
        const { data, error } = await supabase
          .from('documentos_alumno')
          .select('id, nombre, tipo, created_at')
          .eq('alumno_id', student.id)
          .eq('visible_para_encargado', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        items = data ?? [];
        break;
      }
    }

    return NextResponse.json(
      { studentId: student.id, items },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch {
    return apiError(500, 'No se pudo cargar la información solicitada.');
  }
}

function escapePostgrestValue(value: string) {
  return `"${value.replaceAll('"', '\\"')}"`;
}
