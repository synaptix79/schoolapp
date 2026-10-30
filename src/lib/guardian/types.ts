export type RelationshipType = 'Padre' | 'Madre' | 'Tutor' | 'Encargado' | 'Abuelo/a' | 'Otro';
export type GuardianLinkStatus = 'active' | 'inactive';

export type AssignedStudent = {
  id: string;
  nombre: string;
  grado: string | null;
  seccion: string | null;
  turno: string | null;
  avatarUrl: string | null;
  estado: 'activo';
  relationshipType: RelationshipType;
  isPrimary: boolean;
};

export type GuardianStudentsResponse = {
  students: AssignedStudent[];
};

export type StudentDashboard = {
  student: AssignedStudent & {
    fechaNacimiento: string | null;
    ci: string | null;
    tipoSangre: string | null;
    contactoEmergencia: string | null;
    observacionesMedicas: string | null;
  };
  summary: {
    attendancePercentage: number | null;
    pendingAssignments: number;
    latestGrade: number | null;
    unreadNotifications: number;
    pendingPayments: number;
  };
  teachers: Array<{
    id: string;
    nombre: string;
    materia: string;
  }>;
  recentNotifications: Array<{
    id: string;
    titulo: string;
    mensaje: string;
    destino: string | null;
    createdAt: string;
  }>;
};

export type GuardianModule =
  | 'attendance'
  | 'grades'
  | 'subjects'
  | 'schedule'
  | 'assignments'
  | 'communications'
  | 'payments'
  | 'documents';

export type GuardianModuleResponse = {
  studentId: string;
  items: Array<Record<string, unknown>>;
};

