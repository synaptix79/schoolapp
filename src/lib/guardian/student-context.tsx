'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { resolveSelectedStudentId } from '@/lib/guardian/access';
import type { AssignedStudent, GuardianStudentsResponse } from '@/lib/guardian/types';

type GuardianStudentContextValue = {
  assignedStudents: AssignedStudent[];
  selectedStudent: AssignedStudent | null;
  selectedStudentId: string | null;
  selectStudent: (studentId: string) => void;
  refreshStudents: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const SESSION_KEY = 'canaan-guardian-selected-student';
const GuardianStudentContext = createContext<GuardianStudentContextValue | null>(null);

export function GuardianStudentProvider({ children }: { children: React.ReactNode }) {
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/guardian/students', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const payload = (await response.json().catch(() => null)) as
        | GuardianStudentsResponse
        | { error?: string }
        | null;

      if (!response.ok || !payload || !('students' in payload)) {
        throw new Error(payload && 'error' in payload ? payload.error : 'No se pudieron cargar los alumnos.');
      }

      const students = payload.students;
      setAssignedStudents(students);
      setSelectedStudentId((current) => {
        const remembered = current ?? sessionStorage.getItem(SESSION_KEY);
        const next = resolveSelectedStudentId(
          students.map((student) => student.id),
          current,
          remembered,
        );

        if (next) sessionStorage.setItem(SESSION_KEY, next);
        else sessionStorage.removeItem(SESSION_KEY);
        return next;
      });
    } catch (requestError) {
      setAssignedStudents([]);
      setSelectedStudentId(null);
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los alumnos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStudents();
  }, [refreshStudents]);

  const selectStudent = useCallback((studentId: string) => {
    if (!assignedStudents.some((student) => student.id === studentId)) return;
    setSelectedStudentId(studentId);
    sessionStorage.setItem(SESSION_KEY, studentId);
  }, [assignedStudents]);

  const selectedStudent = useMemo(
    () => assignedStudents.find((student) => student.id === selectedStudentId) ?? null,
    [assignedStudents, selectedStudentId],
  );

  const value = useMemo<GuardianStudentContextValue>(
    () => ({
      assignedStudents,
      selectedStudent,
      selectedStudentId,
      selectStudent,
      refreshStudents,
      isLoading,
      error,
    }),
    [
      assignedStudents,
      selectedStudent,
      selectedStudentId,
      selectStudent,
      refreshStudents,
      isLoading,
      error,
    ],
  );

  return (
    <GuardianStudentContext.Provider value={value}>
      {children}
    </GuardianStudentContext.Provider>
  );
}

export function useGuardianStudent() {
  const context = useContext(GuardianStudentContext);
  if (!context) {
    throw new Error('useGuardianStudent debe usarse dentro de GuardianStudentProvider');
  }
  return context;
}
