export type GuardianAccessStatus = 'allowed' | 'forbidden' | 'not_found';

export type AccessProfile = {
  id: string;
  role: string;
  schoolId: string;
  active: boolean;
};

export type AccessStudent = {
  id: string;
  schoolId: string;
  active: boolean;
};

export type AccessLink = {
  guardianId: string;
  studentId: string;
  status: 'active' | 'inactive';
};

export const GUARDIAN_CAPABILITIES = Object.freeze({
  readAssignedStudentData: true,
  editGrades: false,
  editAttendance: false,
  editAcademicData: false,
  manageLinks: false,
  accessAdmin: false,
});

export function evaluateGuardianAccess({
  guardian,
  student,
  link,
}: {
  guardian: AccessProfile | null;
  student: AccessStudent | null;
  link: AccessLink | null;
}): GuardianAccessStatus {
  if (!guardian || guardian.role !== 'padre_encargado' || !guardian.active) {
    return 'forbidden';
  }

  if (!student || !student.active || student.schoolId !== guardian.schoolId) {
    return 'not_found';
  }

  if (
    !link
    || link.guardianId !== guardian.id
    || link.studentId !== student.id
    || link.status !== 'active'
  ) {
    return 'forbidden';
  }

  return 'allowed';
}

export function accessStatusToHttp(status: GuardianAccessStatus) {
  if (status === 'allowed') return 200;
  if (status === 'not_found') return 404;
  return 403;
}

export function resolveSelectedStudentId(
  assignedStudentIds: string[],
  currentStudentId: string | null,
  rememberedStudentId: string | null,
) {
  const preferred = currentStudentId ?? rememberedStudentId;
  if (preferred && assignedStudentIds.includes(preferred)) return preferred;
  return assignedStudentIds[0] ?? null;
}

export function validateGuardianLinkCreation({
  guardianRole,
  guardianSchoolId,
  studentSchoolId,
  duplicate,
}: {
  guardianRole: string;
  guardianSchoolId: string;
  studentSchoolId: string;
  duplicate: boolean;
}) {
  if (guardianRole !== 'padre_encargado') return 'invalid_guardian' as const;
  if (guardianSchoolId !== studentSchoolId) return 'cross_school' as const;
  if (duplicate) return 'duplicate' as const;
  return 'allowed' as const;
}

export function studentResourceKey(studentId: string, resource: string) {
  return `${studentId}:${resource}`;
}
