import type {
  AssignedStudent,
  GuardianModule,
  GuardianModuleResponse,
  StudentDashboard,
} from '@/lib/guardian/types';

export const demoGuardianStudents: AssignedStudent[] = [
  {
    id: 'alumno-1',
    nombre: 'Ana López',
    grado: '3.º EEB',
    seccion: 'A',
    turno: 'Mañana',
    avatarUrl: null,
    estado: 'activo',
    relationshipType: 'Padre',
    isPrimary: true,
  },
  {
    id: 'alumno-2',
    nombre: 'Mateo López',
    grado: '1.º EEB',
    seccion: 'B',
    turno: 'Mañana',
    avatarUrl: null,
    estado: 'activo',
    relationshipType: 'Padre',
    isPrimary: true,
  },
];

const studentDetails: Record<string, StudentDashboard['student']> = {
  'alumno-1': {
    ...demoGuardianStudents[0],
    fechaNacimiento: '2016-04-12',
    ci: '1.234.567',
    tipoSangre: 'A+',
    contactoEmergencia: 'María López · +595 981 111 222',
    observacionesMedicas: 'Sin alergias conocidas. Usa lente correctivo en ojo derecho.',
  },
  'alumno-2': {
    ...demoGuardianStudents[1],
    fechaNacimiento: '2018-09-08',
    ci: '2.345.678',
    tipoSangre: 'O+',
    contactoEmergencia: 'Juan López · +595 981 000 003',
    observacionesMedicas: 'Alérgico a la penicilina.',
  },
};

export function getDemoGuardianDashboard(studentId: string): StudentDashboard | null {
  const student = studentDetails[studentId];
  if (!student) return null;

  const isAna = studentId === 'alumno-1';
  return {
    student,
    summary: {
      attendancePercentage: isAna ? 96 : 94,
      pendingAssignments: isAna ? 2 : 1,
      latestGrade: isAna ? 4.8 : 4.6,
      unreadNotifications: isAna ? 2 : 1,
      pendingPayments: 1,
    },
    teachers: isAna
      ? [
          { id: 'demo-profesor', nombre: 'Prof. Marta Benítez', materia: 'Comunicación' },
          { id: 'demo-profesor-2', nombre: 'Prof. Diego Fernández', materia: 'Matemática' },
        ]
      : [
          { id: 'demo-profesor', nombre: 'Prof. Marta Benítez', materia: 'Comunicación' },
          { id: 'demo-profesor-3', nombre: 'Prof. Laura Rojas', materia: 'Matemática' },
        ],
    recentNotifications: [
      {
        id: `notificacion-${studentId}-1`,
        titulo: isAna ? 'Tarea de Ciencias' : 'Lectura guiada',
        mensaje: isAna
          ? 'Recordá entregar la observación de la planta el lunes.'
          : 'La actividad de lectura será el martes.',
        destino: '/padre/agenda',
        createdAt: '2026-07-28T12:00:00-04:00',
      },
    ],
  };
}

export function getDemoGuardianModule(
  studentId: string,
  module: GuardianModule,
): GuardianModuleResponse | null {
  if (!studentDetails[studentId]) return null;
  const isAna = studentId === 'alumno-1';

  const itemsByModule: Record<GuardianModule, Array<Record<string, unknown>>> = {
    attendance: [
      { id: `${studentId}-asis-1`, fecha: '2026-07-28', estado: 'presente', observacion: 'Ingreso puntual' },
      { id: `${studentId}-asis-2`, fecha: '2026-07-25', estado: 'presente', observacion: null },
    ],
    grades: [
      {
        id: `${studentId}-nota-1`,
        materia: isAna ? 'Comunicación' : 'Matemática',
        nota: isAna ? 4.8 : 4.6,
        periodo: '1.er trimestre',
        observacion: isAna ? 'Excelente comprensión lectora.' : 'Muy buen trabajo con números.',
      },
      {
        id: `${studentId}-nota-2`,
        materia: isAna ? 'Matemática' : 'Comunicación',
        nota: isAna ? 4.6 : 4.4,
        periodo: '1.er trimestre',
      },
    ],
    subjects: [
      { id: `${studentId}-materia-1`, nombre: 'Comunicación', profesor_id: 'Prof. Marta Benítez' },
      { id: `${studentId}-materia-2`, nombre: 'Matemática', profesor_id: isAna ? 'Prof. Diego Fernández' : 'Prof. Laura Rojas' },
    ],
    schedule: [
      { id: `${studentId}-horario-1`, dia_semana: 1, hora_inicio: '07:15', hora_fin: '08:00', aula: isAna ? '3A' : '1B', turno: 'Mañana' },
      { id: `${studentId}-horario-2`, dia_semana: 2, hora_inicio: '08:00', hora_fin: '08:45', aula: isAna ? '3A' : '1B', turno: 'Mañana' },
    ],
    assignments: [
      {
        id: `${studentId}-tarea-1`,
        titulo: isAna ? 'Observación de una planta' : 'Lectura guiada',
        materia: isAna ? 'Ciencias Naturales' : 'Comunicación',
        consigna: isAna ? 'Completar la ficha de observación.' : 'Leer las páginas 12 a 15.',
        vence_at: '2026-08-03',
        entrega: { estado: 'pendiente' },
      },
    ],
    communications: [
      {
        id: `${studentId}-comunicado-1`,
        titulo: 'Entrega de boletines',
        contenido: 'Los informes del trimestre estarán disponibles desde el martes.',
        grado: studentDetails[studentId].grado,
        publicado_at: '2026-07-27T09:00:00-04:00',
      },
    ],
    payments: [
      {
        id: `${studentId}-pago-1`,
        concepto: 'Cuota de julio',
        estado: 'pendiente',
        monto: 350000,
        moneda: 'PYG',
        vencimiento: '2026-08-05',
      },
    ],
    documents: [
      {
        id: `${studentId}-documento-1`,
        nombre: 'Boletín del primer trimestre',
        tipo: 'boletín',
        created_at: '2026-07-20T10:00:00-04:00',
      },
    ],
  };

  return { studentId, items: itemsByModule[module] };
}
