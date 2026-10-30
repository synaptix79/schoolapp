'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useGuardianStudent } from '@/lib/guardian/student-context';

export function useStudentResource<T>(resource: string) {
  const { selectedStudentId, refreshStudents } = useGuardianStudent();
  const [data, setData] = useState<T | null>(null);
  const [dataStudentId, setDataStudentId] = useState<string | null>(null);
  const [requestStudentId, setRequestStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const load = useCallback(async () => {
    if (!selectedStudentId) {
      setData(null);
      setDataStudentId(null);
      setRequestStudentId(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const sequence = ++requestSequence.current;
    const controller = new AbortController();
    setRequestStudentId(selectedStudentId);
    setData(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/guardian/students/${encodeURIComponent(selectedStudentId)}/${resource}`,
        {
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        },
      );
      const payload = await response.json().catch(() => null) as T | { error?: string } | null;
      if (!response.ok) {
        if (response.status === 403) {
          await refreshStudents();
          return;
        }
        const fallback = response.status === 401
          ? 'Tu sesión expiró. Volvé a iniciar sesión.'
          : 'No se pudo cargar la información.';
        throw new Error(payload && typeof payload === 'object' && 'error' in payload ? payload.error : fallback);
      }
      if (sequence === requestSequence.current) {
        setData(payload as T);
        setDataStudentId(selectedStudentId);
      }
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      if (sequence === requestSequence.current) {
        setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar la información.');
      }
    } finally {
      if (sequence === requestSequence.current) setIsLoading(false);
    }

    return () => controller.abort();
  }, [refreshStudents, resource, selectedStudentId]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function run() {
      if (!selectedStudentId) {
        setData(null);
        setDataStudentId(null);
        setRequestStudentId(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      const sequence = ++requestSequence.current;
      setRequestStudentId(selectedStudentId);
      setData(null);
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/guardian/students/${encodeURIComponent(selectedStudentId)}/${resource}`,
          {
            credentials: 'same-origin',
            cache: 'no-store',
            signal: controller.signal,
          },
        );
        const payload = await response.json().catch(() => null) as T | { error?: string } | null;
        if (!response.ok) {
          if (response.status === 403) {
            await refreshStudents();
            return;
          }
          const fallback = response.status === 401
            ? 'Tu sesión expiró. Volvé a iniciar sesión.'
            : 'No se pudo cargar la información.';
          throw new Error(payload && typeof payload === 'object' && 'error' in payload ? payload.error : fallback);
        }
        if (active && sequence === requestSequence.current) {
          setData(payload as T);
          setDataStudentId(selectedStudentId);
        }
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        if (active && sequence === requestSequence.current) {
          setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar la información.');
        }
      } finally {
        if (active && sequence === requestSequence.current) setIsLoading(false);
      }
    }

    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshStudents, resource, selectedStudentId]);

  const dataMatchesSelection = Boolean(selectedStudentId && dataStudentId === selectedStudentId);
  const requestMatchesSelection = Boolean(selectedStudentId && requestStudentId === selectedStudentId);
  return {
    data: dataMatchesSelection ? data : null,
    isLoading: Boolean(selectedStudentId) && (!requestMatchesSelection || isLoading),
    error: requestMatchesSelection ? error : null,
    reload: load,
  };
}
