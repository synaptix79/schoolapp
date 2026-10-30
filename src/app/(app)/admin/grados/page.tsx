
import { formatAcademicLabel } from '@/lib/academic-levels';
import { DemoTable, PageIntro } from '@/components/app/demo-blocks';
import { BulkImporter } from '@/components/app/bulk-importer';
import { demoGrades } from '@/lib/demo';

export default function AdminGradosPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dirección · grados"
        title="Grados, secciones y profesores asignados."
        description="Demo de la estructura que define qué ve cada docente y qué avisos llegan a cada alumno."
      />

      <DemoTable
        columns={['Grado', 'Sección', 'Año', 'Profesor', 'Alumnos']}
        rows={demoGrades.map((grade) => [formatAcademicLabel(grade.grado), grade.seccion, grade.anioLectivo, grade.profesor, grade.alumnos])}
      />

      <BulkImporter
        kind="grados"
        title="Importar grados por Excel o CSV"
        description="La carga nunca guarda directo: primero se descarga la plantilla, se sube el archivo, se revisan errores fila por fila y recién después se confirman las filas válidas."
        roleLabel="Dirección · carga masiva"
        allowedRole="direccion"
      />
    </div>
  );
}
