import { NextResponse } from 'next/server';

import { apiError, isUuid, loadAuthorizedStudent, requireApiSession } from '@/lib/guardian/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string; documentId: string }> },
) {
  const auth = await requireApiSession(['padre_encargado']);
  if (auth.response) return auth.response;

  const { studentId, documentId } = await params;
  if (!isUuid(documentId)) return apiError(404, 'No se encontró el recurso solicitado.');

  const loaded = await loadAuthorizedStudent(auth.session, studentId);
  if (loaded.response) return loaded.response;

  const { data: document, error } = await auth.session.supabase
    .from('documentos_alumno')
    .select('id, storage_path')
    .eq('id', documentId)
    .eq('alumno_id', loaded.student.id)
    .eq('visible_para_encargado', true)
    .maybeSingle();

  if (error || !document) return apiError(404, 'No se encontró el recurso solicitado.');

  const { data: signedFile, error: signedFileError } = await auth.session.supabase.storage
    .from('student-documents')
    .createSignedUrl(document.storage_path, 60);

  if (signedFileError || !signedFile) {
    return apiError(500, 'No se pudo abrir el documento.');
  }

  return NextResponse.redirect(signedFile.signedUrl, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

